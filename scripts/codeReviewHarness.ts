#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

type ScopeType = 'folder' | 'file' | 'working-tree' | 'commit';
type TargetMode = 'whole-file' | 'current-changes';
type ProjectName =
	| 'backend'
	| 'frontend'
	| 'integration-tests'
	| 'api'
	| 'core'
	| 'ui'
	| 'common'
	| 'unknown';

type HarnessOptions = {
	scopeType: ScopeType;
	scopeValue?: string;
	targetMode: TargetMode;
	coverageThreshold: number;
	maxRetriesGlobal: number;
	maxRetriesSegment: number;
	maxRetriesFile: number;
	aiCommand?: string;
	dryRun: boolean;
	verbose: boolean;
	monitoringDirectory: string;
};

type ResolvedScope = {
	candidateFiles: string[];
	changedFiles: string[];
};

type FileClassification = {
	filePath: string;
	projectName: ProjectName;
};

type ExcludedFile = {
	filePath: string;
	reason: string;
};

type SegmentResult = {
	ok: boolean;
	output: string;
	error?: string;
	attempts: number;
};

type MetadataRequest = {
	filePath: string;
	projectName: ProjectName;
	targetMode: TargetMode;
	coverageThreshold: number;
	repositoryRules: {
		testInstructionsFile: string;
		copilotInstructionsFile: string;
	};
};

type MetadataResponse = {
	targetFilePath: string;
	suggestedTestFilePaths: string[];
	recommendedCoverageCommand: string;
	recommendedTestCommand: string;
	behaviorsToTest: string[];
	blockers?: string[];
};

type CoverageMeasurement = {
	coveragePercentage: number | null;
	coverageFilePath: string;
	normalizedTargetPath: string;
	wasCommandExecuted: boolean;
};

type InstructionViolation = {
	filePath: string;
	line: number;
	ruleId: string;
	description: string;
	instructionsSource: string;
	matchText: string;
};

const DEFAULT_MONITORING_DIRECTORY = '_testMonitoring/codeReviewHarness';

let globalSegmentCounter = 0;

function main() {
	const options = parseOptions(process.argv.slice(2));
	const monitoringDirectory = recreateMonitoringDirectory(options.monitoringDirectory);
	const normalizedOptions: HarnessOptions = {
		...options,
		monitoringDirectory,
	};

	printHeader(normalizedOptions);
	printProgress('Phase 1/6: resolving scope and candidate files...');

	const scopeResult = runSegmentWithRetry({
		segmentName: 'resolve-scope',
		monitoringDirectory: normalizedOptions.monitoringDirectory,
		maxRetries: normalizedOptions.maxRetriesSegment,
		verbose: normalizedOptions.verbose,
		run: () => {
			const resolvedScope = resolveScope(normalizedOptions);
			return toJson(resolvedScope);
		},
	});
	assertSegmentSucceeded(scopeResult, 'resolve-scope');
	const resolvedScope = JSON.parse(scopeResult.output) as ResolvedScope;

	if (resolvedScope.candidateFiles.length === 0) {
		console.log('\nNo candidate files found for selected scope and target mode. Exiting successfully.\n');
		process.exit(0);
	}

	const classificationResult = runSegmentWithRetry({
		segmentName: 'classify-and-filter-files',
		monitoringDirectory: normalizedOptions.monitoringDirectory,
		maxRetries: normalizedOptions.maxRetriesSegment,
		verbose: normalizedOptions.verbose,
		run: () => {
			const classifications = classifyFiles(resolvedScope.candidateFiles);
			const filterResult = filterTestableFiles(classifications);

			return toJson(filterResult);
		},
	});
	assertSegmentSucceeded(classificationResult, 'classify-and-filter-files');
	printProgress('Phase 2/6: classifying files and applying testability filters...');

	const parsedFilterResult = JSON.parse(classificationResult.output) as {
		testableFiles: FileClassification[];
		excludedFiles: ExcludedFile[];
	};

	printClassificationSummary(parsedFilterResult);

	if (parsedFilterResult.testableFiles.length === 0) {
		console.log('\nNo testable files found after filtering. Exiting successfully.\n');
		process.exit(0);
	}

	runScopeQualityGates({
		options: normalizedOptions,
		resolvedScope,
		testableFiles: parsedFilterResult.testableFiles,
	});
	printProgress('Phase 3/6: quality gates complete (prettier, eslint, ts-check).');

	const queueResult = runSegmentWithRetry({
		segmentName: 'build-queue-manifest',
		monitoringDirectory: normalizedOptions.monitoringDirectory,
		maxRetries: normalizedOptions.maxRetriesSegment,
		verbose: normalizedOptions.verbose,
		run: () => {
			const manifest = {
				scopeType: normalizedOptions.scopeType,
				scopeValue: normalizedOptions.scopeValue ?? null,
				targetMode: normalizedOptions.targetMode,
				candidateCount: resolvedScope.candidateFiles.length,
				changedCount: resolvedScope.changedFiles.length,
				testableCount: parsedFilterResult.testableFiles.length,
				excludedCount: parsedFilterResult.excludedFiles.length,
				excludedFiles: parsedFilterResult.excludedFiles,
			};

			return toJson(manifest);
		},
	});
	assertSegmentSucceeded(queueResult, 'build-queue-manifest');
	printProgress('Phase 4/6: queue manifest created.');

	const iterationResult = processFilesSequentially({
		options: normalizedOptions,
		resolvedScope,
		testableFiles: parsedFilterResult.testableFiles,
	});

	emitFinalSummary({
		options: normalizedOptions,
		resolvedScope,
		testableFiles: parsedFilterResult.testableFiles,
		excludedFiles: parsedFilterResult.excludedFiles,
		fileResults: iterationResult,
	});
	printRunSummary({
		fileResults: iterationResult,
		coverageThreshold: normalizedOptions.coverageThreshold,
	});

	const hasFailures = iterationResult.some((item) => item.status === 'failed');
	printProgress('Phase 6/6: final summary emitted.');

	if (hasFailures) {
		console.error('\nHarness finished with failures. See monitoring reports for details.\n');
		process.exit(1);
	}

	console.log('\nHarness finished successfully.\n');
}

function printHeader(options: HarnessOptions) {
	console.log('\n=== Code Review Quality and Coverage Harness ===\n');
	console.log(`Scope type: ${options.scopeType}`);
	console.log(`Scope value: ${options.scopeValue ?? '(none)'}`);
	console.log(`Target mode: ${options.targetMode}`);
	console.log(`Coverage threshold: ${options.coverageThreshold}`);
	console.log(`Dry run: ${options.dryRun ? 'true' : 'false'}`);
	console.log(`Monitoring directory: ${options.monitoringDirectory}\n`);
}

function printProgress(message: string) {
	const timestamp = new Date().toISOString();
	console.log(`[progress ${timestamp}] ${message}`);
}

function printClassificationSummary(result: {
	testableFiles: FileClassification[];
	excludedFiles: ExcludedFile[];
}) {
	const { testableFiles, excludedFiles } = result;

	console.log('');
	console.log('Classification summary:');
	console.log(`- Testable files: ${testableFiles.length}`);
	console.log(`- Excluded files: ${excludedFiles.length}`);

	if (excludedFiles.length > 0) {
		const groupedByReason = excludedFiles.reduce<Record<string, number>>((accumulator, excludedFile) => {
			const current = accumulator[excludedFile.reason] ?? 0;
			return {
				...accumulator,
				[excludedFile.reason]: current + 1,
			};
		}, {});

		for (const reason of Object.keys(groupedByReason).sort()) {
			console.log(`  - ${reason}: ${groupedByReason[reason]}`);
		}
	}

	console.log('');
}

function parseOptions(argumentsList: string[]): HarnessOptions {
	if (argumentsList.includes('--help') || argumentsList.includes('-h')) {
		printHelp();
		process.exit(0);
	}

	const parsed = parseRawArguments(argumentsList);

	const scopeType = getEnumValue<ScopeType>(parsed['scope-type'], [
		'folder',
		'file',
		'working-tree',
		'commit',
	]);
	if (!scopeType) {
		throwInvalidArgument(
			'--scope-type is required and must be one of: folder, file, working-tree, commit.'
		);
	}

	const scopeValue = parsed['scope-value'];
	const requiresScopeValue = scopeType === 'folder' || scopeType === 'file' || scopeType === 'commit';

	if (requiresScopeValue && !scopeValue) {
		throwInvalidArgument(`--scope-value is required when --scope-type is ${scopeType}.`);
	}

	const targetMode =
		getEnumValue<TargetMode>(parsed['target-mode'], ['whole-file', 'current-changes']) ??
		'current-changes';

	const coverageThreshold = parsePositiveNumber(parsed['coverage-threshold'] ?? '80', '--coverage-threshold');
	const maxRetriesGlobal = parseNonNegativeInteger(parsed['max-retries-global'] ?? '2', '--max-retries-global');
	const maxRetriesSegment = parseNonNegativeInteger(
		parsed['max-retries-segment'] ?? '2',
		'--max-retries-segment'
	);
	const maxRetriesFile = parseNonNegativeInteger(parsed['max-retries-file'] ?? '2', '--max-retries-file');

	const aiCommand = parsed['ai-command'];
	const dryRun = argumentsList.includes('--dry-run');
	const verbose = parsed.verbose === 'true' || argumentsList.includes('--verbose');

	const monitoringDirectory = parsed['monitoring-dir'] ?? DEFAULT_MONITORING_DIRECTORY;

	return {
		scopeType,
		scopeValue,
		targetMode,
		coverageThreshold,
		maxRetriesGlobal,
		maxRetriesSegment,
		maxRetriesFile,
		aiCommand,
		dryRun,
		verbose,
		monitoringDirectory,
	};
}

function printHelp() {
	console.log('Usage:');
	console.log('  yarn code-review:harness --scope-type <type> [options]');
	console.log('');
	console.log('Required:');
	console.log('  --scope-type <folder|file|working-tree|commit>');
	console.log('  --scope-value <value> (required for folder/file/commit)');
	console.log('');
	console.log('Options:');
	console.log('  --target-mode <whole-file|current-changes>  Default: current-changes');
	console.log('  --coverage-threshold <number>               Default: 80');
	console.log('  --max-retries-global <number>               Default: 2');
	console.log('  --max-retries-segment <number>              Default: 2');
	console.log('  --max-retries-file <number>                 Default: 2');
	console.log('  --ai-command <command>                      Required when not using --dry-run');
	console.log('  --monitoring-dir <path>                     Default: _testMonitoring/codeReviewHarness');
	console.log('  --dry-run                                   Plan and validate only');
	console.log('  --verbose                                   Print full command output');
	console.log('');
	console.log('Examples:');
	console.log('  yarn code-review:harness --scope-type working-tree --target-mode current-changes --dry-run');
	console.log('  yarn code-review:harness --scope-type file --scope-value backend/routes/video/video.ts --target-mode whole-file --dry-run');
	console.log('  yarn code-review:harness --scope-type commit --scope-value <sha> --target-mode current-changes --ai-command "copilot"');
}

function parseRawArguments(argumentsList: string[]): Record<string, string> {
	const result: Record<string, string> = {};

	let index = 0;
	while (index < argumentsList.length) {
		const current = argumentsList[index];

		if (!current.startsWith('--')) {
			throwInvalidArgument(`Unexpected argument '${current}'.`);
		}

		const key = current.replace(/^--/, '');
		const next = argumentsList[index + 1];
		const isNextValue = !!next && !next.startsWith('--');

		if (isNextValue) {
			result[key] = next;
			index += 2;
			continue;
		}

		result[key] = 'true';
		index += 1;
	}

	return result;
}

function getEnumValue<T extends string>(value: string | undefined, allowed: T[]): T | null {
	if (!value) return null;
	return allowed.includes(value as T) ? (value as T) : null;
}

function parsePositiveNumber(rawValue: string, argumentName: string): number {
	const parsedNumber = Number(rawValue);

	const isValid = Number.isFinite(parsedNumber) && parsedNumber > 0;
	if (!isValid) {
		throwInvalidArgument(`${argumentName} must be a positive number.`);
	}

	return parsedNumber;
}

function parseNonNegativeInteger(rawValue: string, argumentName: string): number {
	const parsedNumber = Number(rawValue);

	const isValid = Number.isInteger(parsedNumber) && parsedNumber >= 0;
	if (!isValid) {
		throwInvalidArgument(`${argumentName} must be a non-negative integer.`);
	}

	return parsedNumber;
}

function throwInvalidArgument(message: string): never {
	console.error(`\nInvalid arguments: ${message}\n`);
	printHelp();
	process.exit(1);
}

function recreateMonitoringDirectory(requestedPath: string): string {
	const absoluteRequestedPath = path.resolve(requestedPath);

	const createDirectory = (directoryPath: string) => {
		fs.mkdirSync(directoryPath, { recursive: true });
	};

	try {
		fs.rmSync(absoluteRequestedPath, { recursive: true, force: true });
		createDirectory(absoluteRequestedPath);
		return absoluteRequestedPath;
	} catch (error) {
		const errorCode = getErrorCode(error);
		const isPermissionError = errorCode === 'EACCES' || errorCode === 'EPERM';

		if (!isPermissionError) {
			throw error;
		}

		const fallbackDirectoryName = `${path.basename(requestedPath)}-${Date.now()}`;
		const fallbackDirectoryPath = path.resolve(fallbackDirectoryName);

		createDirectory(fallbackDirectoryPath);

		console.warn('\nPermission denied recreating monitoring directory. Using fallback directory.\n');
		console.warn(`Requested: ${absoluteRequestedPath}`);
		console.warn(`Fallback : ${fallbackDirectoryPath}\n`);

		return fallbackDirectoryPath;
	}
}

function getErrorCode(error: unknown): string | undefined {
	if (!error || typeof error !== 'object') return undefined;
	if (!('code' in error)) return undefined;

	const maybeCode = (error as { code?: string }).code;
	return maybeCode;
}

function resolveScope(options: HarnessOptions): ResolvedScope {
	const workspaceRoot = process.cwd();

	const candidateFiles = (() => {
		if (options.scopeType === 'working-tree') {
			if (options.targetMode === 'whole-file') {
				return uniqueStrings(getWorkingTreeChangedFiles()).map((filePath) =>
					normalizeWorkspacePath(filePath, workspaceRoot)
				);
			}

			return uniqueStrings(getWorkingTreeChangedFiles()).map((filePath) =>
				normalizeWorkspacePath(filePath, workspaceRoot)
			);
		}

		if (options.scopeType === 'commit') {
			const commitFiles = getCommitChangedFiles(options.scopeValue as string).map((filePath) =>
				normalizeWorkspacePath(filePath, workspaceRoot)
			);
			if (options.targetMode === 'whole-file') {
				return uniqueStrings(commitFiles);
			}

			return uniqueStrings(commitFiles);
		}

		if (options.scopeType === 'file') {
			const normalizedFilePath = normalizeWorkspacePath(options.scopeValue as string, workspaceRoot);
			if (!fs.existsSync(path.resolve(normalizedFilePath))) {
				throw new Error(`Scope file does not exist: ${normalizedFilePath}`);
			}

			if (options.targetMode === 'whole-file') {
				return [normalizedFilePath];
			}

			const hasChanges = getWorkingTreeChangedFiles()
				.map((filePath) => normalizeWorkspacePath(filePath, workspaceRoot))
				.includes(normalizedFilePath);
			return hasChanges ? [normalizedFilePath] : [];
		}

		if (options.scopeType === 'folder') {
			const folderPath = normalizeWorkspacePath(options.scopeValue as string, workspaceRoot);
			const folderAbsolutePath = path.resolve(folderPath);
			if (!fs.existsSync(folderAbsolutePath)) {
				throw new Error(`Scope folder does not exist: ${folderPath}`);
			}

			if (options.targetMode === 'whole-file') {
				return getTrackedFilesUnderPath(folderPath);
			}

			const changedFiles = getWorkingTreeChangedFiles().map((filePath) =>
				normalizeWorkspacePath(filePath, workspaceRoot)
			);
			return changedFiles.filter((filePath) => filePath.startsWith(`${folderPath}/`));
		}

		return [];
	})();

	const changedFiles = (() => {
		if (options.scopeType === 'commit') {
			return uniqueStrings(getCommitChangedFiles(options.scopeValue as string)).map((filePath) =>
				normalizeWorkspacePath(filePath, workspaceRoot)
			);
		}

		return uniqueStrings(getWorkingTreeChangedFiles()).map((filePath) =>
			normalizeWorkspacePath(filePath, workspaceRoot)
		);
	})();

	return {
		candidateFiles: uniqueStrings(candidateFiles).sort(),
		changedFiles: uniqueStrings(changedFiles).sort(),
	};
}

function getWorkingTreeChangedFiles(): string[] {
	const trackedChanges = runCommandCapture(
		'git diff --name-only --diff-filter=AM HEAD',
		'Unable to read tracked working-tree changes.'
	)
		.split('\n')
		.map((entry) => entry.trim())
		.filter(Boolean);

	const untrackedChanges = runCommandCapture(
		'git ls-files --others --exclude-standard',
		'Unable to read untracked working-tree changes.'
	)
		.split('\n')
		.map((entry) => entry.trim())
		.filter(Boolean);

	return uniqueStrings([...trackedChanges, ...untrackedChanges]);
}

function getCommitChangedFiles(commitSha: string): string[] {
	const output = runCommandCapture(
		`git diff-tree --no-commit-id --name-only -r ${shellQuote(commitSha)}`,
		`Unable to read files changed by commit ${commitSha}.`
	);

	return output
		.split('\n')
		.map((entry) => entry.trim())
		.filter(Boolean);
}

function getTrackedFilesUnderPath(relativePath: string): string[] {
	const output = runCommandCapture(
		`git ls-files ${shellQuote(relativePath)}`,
		`Unable to list tracked files under path ${relativePath}.`
	);

	return output
		.split('\n')
		.map((entry) => entry.trim())
		.filter(Boolean);
}

function classifyFiles(filePaths: string[]): FileClassification[] {
	return filePaths.map((filePath) => ({
		filePath,
		projectName: inferProjectName(filePath),
	}));
}

function inferProjectName(filePath: string): ProjectName {
	if (filePath.startsWith('backend/')) return 'backend';
	if (filePath.startsWith('frontend/')) return 'frontend';
	if (filePath.startsWith('integration-tests/')) return 'integration-tests';
	if (filePath.startsWith('libs/api/')) return 'api';
	if (filePath.startsWith('libs/core/')) return 'core';
	if (filePath.startsWith('libs/ui/')) return 'ui';
	if (filePath.startsWith('libs/common/')) return 'common';
	return 'unknown';
}

function filterTestableFiles(classifications: FileClassification[]): {
	testableFiles: FileClassification[];
	excludedFiles: ExcludedFile[];
} {
	const testableFiles: FileClassification[] = [];
	const excludedFiles: ExcludedFile[] = [];

	for (const classification of classifications) {
		const exclusionReason = getExclusionReason(classification);

		if (!exclusionReason) {
			testableFiles.push(classification);
			continue;
		}

		excludedFiles.push({
			filePath: classification.filePath,
			reason: exclusionReason,
		});
	}

	return {
		testableFiles,
		excludedFiles,
	};
}

function getExclusionReason(classification: FileClassification): string | null {
	const filePath = classification.filePath;
	const fileName = path.basename(filePath);

	if (classification.projectName === 'unknown') return 'unsupported-project';

	if (/\.(test|spec)\.[jt]sx?$/.test(filePath)) return 'already-a-test-file';
	if (/\.d\.ts$/.test(filePath)) return 'declaration-file';
	if (/\/index\.ts$/.test(filePath)) return 'barrel-file';
	if (/\b(node_modules|coverage|dist|docs|reports|tmp|playwright-report|test-results)\b/.test(filePath)) {
		return 'non-runtime-path';
	}
	if (/\.(json|css|scss|md|yml|yaml|svg|png|jpg|jpeg|gif|webp|html)$/.test(filePath)) {
		return 'non-code-file';
	}

	const isConfigFile =
		fileName.includes('config') ||
		fileName.startsWith('tsconfig') ||
		fileName === 'project.json' ||
		fileName === 'vite.config.ts' ||
		fileName === 'jest.config.js';

	if (isConfigFile) return 'config-file';

	const isSourceExtension = /\.[jt]sx?$/.test(filePath);
	if (!isSourceExtension) return 'unsupported-extension';

	return null;
}

function runScopeQualityGates(args: {
	options: HarnessOptions;
	resolvedScope: ResolvedScope;
	testableFiles: FileClassification[];
}) {
	const { options, resolvedScope, testableFiles } = args;

	const qualityTargetFiles =
		options.targetMode === 'whole-file'
			? testableFiles.map((entry) => entry.filePath)
			: testableFiles
					.map((entry) => entry.filePath)
					.filter((filePath) => resolvedScope.changedFiles.includes(filePath));

	if (qualityTargetFiles.length === 0) {
		console.log('\nNo quality-gate target files found for selected target mode.\n');
		return;
	}

	const prettierCommand = `npx prettier --check ${qualityTargetFiles.map(shellQuote).join(' ')}`;
	const eslintCommand = `npx eslint ${qualityTargetFiles.map(shellQuote).join(' ')}`;

	const impactedProjects = uniqueStrings(
		testableFiles
			.map((entry) => entry.projectName)
			.filter((projectName): projectName is Exclude<ProjectName, 'unknown'> => projectName !== 'unknown')
	);

	const tsCheckCommand = `npx nx run-many -t ts-check -p ${impactedProjects.join(',')}`;

	runCommandSegment({
		segmentName: 'quality-prettier-check',
		command: prettierCommand,
		options,
	});

	runCommandSegment({
		segmentName: 'quality-eslint-check',
		command: eslintCommand,
		options,
	});

	runCommandSegment({
		segmentName: 'quality-ts-check',
		command: tsCheckCommand,
		options,
	});
}

function runCommandSegment(args: {
	segmentName: string;
	command: string;
	options: HarnessOptions;
}) {
	const { segmentName, command, options } = args;

	const segmentResult = runSegmentWithRetry({
		segmentName,
		monitoringDirectory: options.monitoringDirectory,
		maxRetries: options.maxRetriesSegment,
		verbose: options.verbose,
		run: () => {
			if (options.dryRun) {
				return `dry-run: ${command}`;
			}

			return runCommandCapture(command, `${segmentName} failed`, { liveOutput: true });
		},
	});

	assertSegmentSucceeded(segmentResult, segmentName);
}

function processFilesSequentially(args: {
	options: HarnessOptions;
	resolvedScope: ResolvedScope;
	testableFiles: FileClassification[];
}): Array<{ filePath: string; status: 'skipped' | 'passed' | 'failed'; reason: string; details?: string }> {
	const { options, resolvedScope, testableFiles } = args;
	const fileResults: Array<{
		filePath: string;
		status: 'skipped' | 'passed' | 'failed';
		reason: string;
		details?: string;
	}> = [];
	let globalRetriesRemaining = options.maxRetriesGlobal;

	for (const [fileIndex, fileClassification] of testableFiles.entries()) {
		const { filePath } = fileClassification;
		printProgress(`Phase 5/6: processing file ${fileIndex + 1}/${testableFiles.length}: ${filePath}`);

		if (options.targetMode === 'current-changes' && !resolvedScope.changedFiles.includes(filePath)) {
			fileResults.push({
				filePath,
				status: 'skipped',
				reason: 'not-in-current-changes',
			});
			continue;
		}

		if (options.dryRun) {
			fileResults.push({
				filePath,
				status: 'passed',
				reason: 'dry-run-planned',
			});
			continue;
		}

		if (!options.aiCommand) {
			fileResults.push({
				filePath,
				status: 'failed',
				reason: 'ai-command-missing',
			});
			continue;
		}

		const metadataResult = runSegmentWithRetry({
			segmentName: `file-metadata-${sanitizeSegmentName(filePath)}-baseline`,
			monitoringDirectory: options.monitoringDirectory,
			maxRetries: options.maxRetriesSegment,
			verbose: options.verbose,
			run: () => runMetadataStep({ fileClassification, options }),
		});

		if (!metadataResult.ok) {
			fileResults.push({
				filePath,
				status: 'failed',
				reason: 'metadata-step-failed',
				details: metadataResult.error,
			});
			continue;
		}

		const metadata = JSON.parse(metadataResult.output) as MetadataResponse;
		printProgress(
			`Metadata ready for ${filePath}: suggestedTests=${metadata.suggestedTestFilePaths.length}, blockers=${metadata.blockers?.length ?? 0}`
		);

		const instructionComplianceResult = runSegmentWithRetry({
			segmentName: `file-instruction-compliance-${sanitizeSegmentName(filePath)}`,
			monitoringDirectory: options.monitoringDirectory,
			maxRetries: options.maxRetriesSegment,
			verbose: options.verbose,
			run: () => {
				const violations = checkInstructionCompliance({
					targetFilePath: filePath,
					suggestedTestFilePaths: metadata.suggestedTestFilePaths,
				});

				if (violations.length > 0) {
					throw new Error(buildInstructionViolationError(violations));
				}

				return toJson({
					status: 'pass',
					checkedFileCount: uniqueStrings([filePath, ...metadata.suggestedTestFilePaths]).length,
				});
			},
		});

		if (!instructionComplianceResult.ok) {
			fileResults.push({
				filePath,
				status: 'failed',
				reason: 'instruction-rules-violation',
				details: instructionComplianceResult.error,
			});
			continue;
		}

		const instructionComplianceOutput = JSON.parse(instructionComplianceResult.output) as {
			status: string;
			checkedFileCount: number;
		};
		printProgress(
			`Instruction compliance ${instructionComplianceOutput.status} for ${filePath} (checked files: ${instructionComplianceOutput.checkedFileCount})`
		);

		const baselineCoverageResult = runSegmentWithRetry({
			segmentName: `file-baseline-coverage-${sanitizeSegmentName(filePath)}`,
			monitoringDirectory: options.monitoringDirectory,
			maxRetries: options.maxRetriesSegment,
			verbose: options.verbose,
			run: () => {
				const measurement = runCoverageMeasurement({
					fileClassification,
					metadata,
					options,
					segmentLabel: 'baseline',
				});

				return toJson(measurement);
			},
		});

		if (!baselineCoverageResult.ok) {
			fileResults.push({
				filePath,
				status: 'failed',
				reason: 'baseline-coverage-failed',
				details: baselineCoverageResult.error,
			});
			continue;
		}

		const baselineCoverage = JSON.parse(baselineCoverageResult.output) as CoverageMeasurement;
		printCoverageObservation({
			filePath,
			coverageThreshold: options.coverageThreshold,
			label: 'Baseline coverage',
			measurement: baselineCoverage,
		});

		if (baselineCoverage.coveragePercentage !== null && baselineCoverage.coveragePercentage >= options.coverageThreshold) {
			fileResults.push({
				filePath,
				status: 'skipped',
				reason: 'already-covered-at-threshold',
				details: `baseline=${baselineCoverage.coveragePercentage}`,
			});
			printProgress(
				`Skipping ${filePath}: baseline coverage ${baselineCoverage.coveragePercentage}% already meets threshold ${options.coverageThreshold}%.`
			);
			continue;
		}

		let filePassed = false;
		let fileFailedByReason = 'file-retries-exhausted';
		let fileDetails = '';
		let shouldRetryFromGlobalBudget = true;

		while (shouldRetryFromGlobalBudget) {
			let attemptCounter = 0;
			shouldRetryFromGlobalBudget = false;

			while (attemptCounter <= options.maxRetriesFile) {
				attemptCounter += 1;
				printProgress(
					`File iteration attempt ${attemptCounter}/${options.maxRetriesFile + 1} for ${filePath}`
				);

				const executionStepResult = runSegmentWithRetry({
					segmentName: `file-iteration-${sanitizeSegmentName(filePath)}-attempt-${attemptCounter}`,
					monitoringDirectory: options.monitoringDirectory,
					maxRetries: options.maxRetriesSegment,
					verbose: options.verbose,
					run: () => {
						runCommandCapture(
							metadata.recommendedTestCommand,
							`File test command failed for ${filePath}.`,
							{ liveOutput: true }
						);

						const measurement = runCoverageMeasurement({
							fileClassification,
							metadata,
							options,
							segmentLabel: `attempt-${attemptCounter}`,
						});

						return toJson(measurement);
					},
				});

				if (!executionStepResult.ok) {
					fileFailedByReason = 'iteration-step-failed';
					fileDetails = executionStepResult.error ?? '';
					if (attemptCounter > options.maxRetriesFile) {
						break;
					}
					continue;
				}

				const measurement = JSON.parse(executionStepResult.output) as CoverageMeasurement;
				printCoverageObservation({
					filePath,
					coverageThreshold: options.coverageThreshold,
					label: `Post-test coverage (attempt ${attemptCounter})`,
					measurement,
				});
				const hasValidCoverage = measurement.coveragePercentage !== null;

				if (!hasValidCoverage) {
					fileFailedByReason = 'coverage-not-found';
					fileDetails = `lcov=${measurement.coverageFilePath}`;
					if (attemptCounter > options.maxRetriesFile) {
						break;
					}
					continue;
				}

				if ((measurement.coveragePercentage as number) < options.coverageThreshold) {
					fileFailedByReason = 'coverage-below-threshold';
					fileDetails = `coverage=${measurement.coveragePercentage} threshold=${options.coverageThreshold}`;
					if (attemptCounter > options.maxRetriesFile) {
						break;
					}
					continue;
				}

				filePassed = true;
				fileDetails = `coverage=${measurement.coveragePercentage}`;
				break;
			}

			if (filePassed) {
				break;
			}

			if (globalRetriesRemaining > 0) {
				globalRetriesRemaining -= 1;
				shouldRetryFromGlobalBudget = true;

				console.warn(
					`File ${filePath} failed local retries; consuming global retry. Remaining global retries: ${globalRetriesRemaining}`
				);
			}
		}

		if (filePassed) {
			fileResults.push({
				filePath,
				status: 'passed',
				reason: 'coverage-threshold-reached',
				details: fileDetails,
			});
			continue;
		}

		fileResults.push({
			filePath,
			status: 'failed',
			reason: fileFailedByReason,
			details: fileDetails,
		});
	}

	return fileResults;
}

function printCoverageObservation(args: {
	filePath: string;
	coverageThreshold: number;
	label: string;
	measurement: CoverageMeasurement;
}) {
	const { filePath, coverageThreshold, label, measurement } = args;

	if (measurement.coveragePercentage === null) {
		printProgress(
			`${label} unavailable for ${filePath} (target not found in ${measurement.coverageFilePath}).`
		);
		return;
	}

	const thresholdStatus =
		measurement.coveragePercentage >= coverageThreshold ? 'meets-threshold' : 'below-threshold';

	printProgress(
		`${label} for ${filePath}: ${measurement.coveragePercentage}% (threshold=${coverageThreshold}% -> ${thresholdStatus})`
	);
}

function printRunSummary(args: {
	fileResults: Array<{ filePath: string; status: 'skipped' | 'passed' | 'failed'; reason: string; details?: string }>;
	coverageThreshold: number;
}) {
	const { fileResults, coverageThreshold } = args;

	const passedCount = fileResults.filter((entry) => entry.status === 'passed').length;
	const skippedCount = fileResults.filter((entry) => entry.status === 'skipped').length;
	const failedCount = fileResults.filter((entry) => entry.status === 'failed').length;

	console.log('');
	console.log(`Run summary (coverage threshold ${coverageThreshold}%):`);
	console.log(`- Passed : ${passedCount}`);
	console.log(`- Skipped: ${skippedCount}`);
	console.log(`- Failed : ${failedCount}`);

	for (const result of fileResults) {
		const detailsSuffix = result.details ? ` | ${result.details}` : '';
		console.log(`  - [${result.status}] ${result.filePath} | ${result.reason}${detailsSuffix}`);
	}

	console.log('');
}

function runMetadataStep(args: {
	fileClassification: FileClassification;
	options: HarnessOptions;
}): string {
	const { fileClassification, options } = args;

	if (!options.aiCommand) {
		throw new Error('Missing --ai-command. Provide an AI command or use --dry-run.');
	}

	const request: MetadataRequest = {
		filePath: fileClassification.filePath,
		projectName: fileClassification.projectName,
		targetMode: options.targetMode,
		coverageThreshold: options.coverageThreshold,
		repositoryRules: {
			testInstructionsFile: '.github/instructions/test-files.instructions.md',
			copilotInstructionsFile: '.github/copilot-instructions.md',
		},
	};

	const metadataDirectory = path.join(options.monitoringDirectory, 'metadata');
	fs.mkdirSync(metadataDirectory, { recursive: true });

	const safeName = sanitizeSegmentName(fileClassification.filePath);
	const requestFilePath = path.join(metadataDirectory, `${safeName}.request.json`);
	const responseFilePath = path.join(metadataDirectory, `${safeName}.response.json`);

	fs.writeFileSync(requestFilePath, toJson(request), 'utf-8');

	const aiCommandLine = buildAiCommandLine({
		baseCommand: options.aiCommand,
		requestFilePath,
		responseFilePath,
	});
	runCommandCapture(aiCommandLine, `AI metadata command failed for ${fileClassification.filePath}.`, {
		liveOutput: true,
	});

	if (!fs.existsSync(responseFilePath)) {
		throw new Error(`AI metadata response file was not created: ${responseFilePath}`);
	}

	const responseRaw = fs.readFileSync(responseFilePath, 'utf-8');
	const parsed = JSON.parse(responseRaw) as MetadataResponse;
	validateMetadataResponse(parsed, fileClassification.filePath);

	return toJson(parsed);
}

function buildAiCommandLine(args: {
	baseCommand: string;
	requestFilePath: string;
	responseFilePath: string;
}): string {
	const { baseCommand, requestFilePath, responseFilePath } = args;

	const hasRequestPlaceholder = baseCommand.includes('{requestFile}');
	const hasResponsePlaceholder = baseCommand.includes('{responseFile}');

	if (hasRequestPlaceholder && hasResponsePlaceholder) {
		return baseCommand
			.replace('{requestFile}', shellQuote(requestFilePath))
			.replace('{responseFile}', shellQuote(responseFilePath));
	}

	return `${baseCommand} ${shellQuote(requestFilePath)} ${shellQuote(responseFilePath)}`;
}

function runCoverageMeasurement(args: {
	fileClassification: FileClassification;
	metadata: MetadataResponse;
	options: HarnessOptions;
	segmentLabel: string;
}): CoverageMeasurement {
	const { fileClassification, metadata, segmentLabel } = args;

	runCommandCapture(
		metadata.recommendedCoverageCommand,
		`Coverage command failed for ${fileClassification.filePath} (${segmentLabel}).`,
		{ liveOutput: true }
	);

	const coverageFilePath = getCoverageFilePathForProject(fileClassification.projectName);
	const normalizedTargetPath = path.resolve(fileClassification.filePath).replace(/\\/g, '/');

	if (!coverageFilePath || !fs.existsSync(coverageFilePath)) {
		return {
			coveragePercentage: null,
			coverageFilePath: coverageFilePath ?? '(unknown)',
			normalizedTargetPath,
			wasCommandExecuted: true,
		};
	}

	const coveragePercentage = readFileLineCoveragePercentage({
		lcovFilePath: coverageFilePath,
		targetFilePath: fileClassification.filePath,
	});

	return {
		coveragePercentage,
		coverageFilePath,
		normalizedTargetPath,
		wasCommandExecuted: true,
	};
}

function getCoverageFilePathForProject(projectName: ProjectName): string | null {
	const coverageDirectoryByProject: Partial<Record<ProjectName, string>> = {
		backend: 'backend/coverage',
		frontend: 'frontend/coverage',
		api: 'libs/api/coverage',
		core: 'libs/core/coverage',
		ui: 'libs/ui/coverage',
		common: 'libs/common/coverage',
	};

	const relativeCoverageDirectory = coverageDirectoryByProject[projectName];
	if (!relativeCoverageDirectory) return null;

	return path.resolve(relativeCoverageDirectory, 'lcov.info');
}

function readFileLineCoveragePercentage(args: {
	lcovFilePath: string;
	targetFilePath: string;
}): number | null {
	const { lcovFilePath, targetFilePath } = args;
	const lcovContent = fs.readFileSync(lcovFilePath, 'utf-8');
	const records = lcovContent.split('end_of_record');

	const normalizedTargetPath = path.resolve(targetFilePath).replace(/\\/g, '/');

	for (const record of records) {
		const lines = record
			.split('\n')
			.map((entry) => entry.trim())
			.filter(Boolean);

		const sourceLine = lines.find((line) => line.startsWith('SF:'));
		if (!sourceLine) continue;

		const sourceFilePath = sourceLine.replace(/^SF:/, '').replace(/\\/g, '/');
		const isMatch =
			sourceFilePath === normalizedTargetPath ||
			normalizedTargetPath.endsWith(sourceFilePath) ||
			sourceFilePath.endsWith(normalizedTargetPath);

		if (!isMatch) continue;

		const executableLines = lines.filter((line) => line.startsWith('DA:'));
		if (executableLines.length === 0) return 0;

		const coveredLinesCount = executableLines.reduce((count, entry) => {
			const [, hitCountRaw] = entry.replace('DA:', '').split(',');
			const hitCount = Number(hitCountRaw);
			if (Number.isFinite(hitCount) && hitCount > 0) {
				return count + 1;
			}

			return count;
		}, 0);

		const percentage = (coveredLinesCount / executableLines.length) * 100;
		return Number(percentage.toFixed(2));
	}

	return null;
}

function validateMetadataResponse(response: MetadataResponse, expectedFilePath: string) {
	if (!response.targetFilePath) {
		throw new Error('AI metadata response is missing targetFilePath.');
	}

	if (response.targetFilePath !== expectedFilePath) {
		throw new Error(
			`AI metadata target file mismatch. Expected '${expectedFilePath}', got '${response.targetFilePath}'.`
		);
	}

	if (!Array.isArray(response.suggestedTestFilePaths)) {
		throw new Error('AI metadata response is missing suggestedTestFilePaths array.');
	}

	if (!Array.isArray(response.behaviorsToTest)) {
		throw new Error('AI metadata response is missing behaviorsToTest array.');
	}

	if (!response.recommendedCoverageCommand) {
		throw new Error('AI metadata response is missing recommendedCoverageCommand.');
	}

	if (!response.recommendedTestCommand) {
		throw new Error('AI metadata response is missing recommendedTestCommand.');
	}
}

function emitFinalSummary(args: {
	options: HarnessOptions;
	resolvedScope: ResolvedScope;
	testableFiles: FileClassification[];
	excludedFiles: ExcludedFile[];
	fileResults: Array<{ filePath: string; status: 'skipped' | 'passed' | 'failed'; reason: string }>;
}) {
	const { options, resolvedScope, testableFiles, excludedFiles, fileResults } = args;

	const summary = {
		scopeType: options.scopeType,
		scopeValue: options.scopeValue ?? null,
		targetMode: options.targetMode,
		coverageThreshold: options.coverageThreshold,
		candidateCount: resolvedScope.candidateFiles.length,
		changedCount: resolvedScope.changedFiles.length,
		testableCount: testableFiles.length,
		excludedCount: excludedFiles.length,
		fileResultCount: fileResults.length,
		passedCount: fileResults.filter((result) => result.status === 'passed').length,
		skippedCount: fileResults.filter((result) => result.status === 'skipped').length,
		failedCount: fileResults.filter((result) => result.status === 'failed').length,
		excludedFiles,
		fileResults,
	};

	const summaryPath = path.join(options.monitoringDirectory, '999-final-summary.json');
	fs.writeFileSync(summaryPath, toJson(summary), 'utf-8');
}

function runSegmentWithRetry(args: {
	segmentName: string;
	monitoringDirectory: string;
	maxRetries: number;
	verbose: boolean;
	run: () => string;
}): SegmentResult {
	const { segmentName, monitoringDirectory, maxRetries, verbose, run } = args;

	let attempt = 0;
	let lastErrorMessage = '';

	while (attempt <= maxRetries) {
		attempt += 1;
		printProgress(`Starting segment '${segmentName}' attempt ${attempt}/${maxRetries + 1}`);

		try {
			const output = run();

			writeSegmentReport({
				monitoringDirectory,
				segmentName,
				attempts: attempt,
				ok: true,
				output,
			});

			if (verbose) {
				console.log(`\n[segment:${segmentName}] success on attempt ${attempt}\n`);
			}
			printProgress(`Completed segment '${segmentName}' on attempt ${attempt}`);

			return {
				ok: true,
				output,
				attempts: attempt,
			};
		} catch (error) {
			const errorMessage = normalizeError(error);
			lastErrorMessage = errorMessage;

			writeSegmentReport({
				monitoringDirectory,
				segmentName,
				attempts: attempt,
				ok: false,
				output: '',
				error: errorMessage,
			});

			const hasMoreAttempts = attempt <= maxRetries;
			printProgress(`Segment '${segmentName}' failed on attempt ${attempt}`);

			if (!hasMoreAttempts) {
				break;
			}

			const retryDelay = Math.min(250 * attempt, 1000);
			console.warn(
				`[segment:${segmentName}] failed attempt ${attempt}. Retrying in ${retryDelay}ms...`
			);
			blockDelay(retryDelay);
		}
	}

	return {
		ok: false,
		output: '',
		error: lastErrorMessage,
		attempts: attempt,
	};
}

function writeSegmentReport(args: {
	monitoringDirectory: string;
	segmentName: string;
	attempts: number;
	ok: boolean;
	output: string;
	error?: string;
}) {
	const { monitoringDirectory, segmentName, attempts, ok, output, error } = args;

	globalSegmentCounter += 1;
	const segmentNumber = `${globalSegmentCounter}`.padStart(3, '0');
	const fileName = `${segmentNumber}-${sanitizeSegmentName(segmentName)}.md`;
	const reportPath = path.join(monitoringDirectory, fileName);

	const lines = [
		`# Segment ${segmentNumber}`,
		'',
		`- name: ${segmentName}`,
		`- attempts: ${attempts}`,
		`- status: ${ok ? 'success' : 'failure'}`,
		`- timestamp: ${new Date().toISOString()}`,
		'',
		'## Output',
		'',
		'```text',
		redactSensitiveText(output) || '(empty)',
		'```',
	];

	if (error) {
		lines.push('');
		lines.push('## Error');
		lines.push('');
		lines.push('```text');
		lines.push(redactSensitiveText(error));
		lines.push('```');
	}

	fs.writeFileSync(reportPath, lines.join('\n'), 'utf-8');
}

function runCommandCapture(
	command: string,
	errorPrefix: string,
	options?: {
		liveOutput?: boolean;
	}
): string {
	const startedAt = Date.now();
	printProgress(`Running command: ${command}`);
	const shouldStreamLiveOutput = options?.liveOutput === true;

	if (shouldStreamLiveOutput) {
		return runCommandCaptureLive({
			command,
			errorPrefix,
			startedAt,
		});
	}

	try {
		const output = execSync(command, {
			encoding: 'utf-8',
			stdio: ['pipe', 'pipe', 'pipe'],
			env: process.env,
		});

		const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
		printProgress(`Command completed in ${durationSeconds}s`);

		return redactSensitiveText(output);
	} catch (error) {
		const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
		printProgress(`Command failed after ${durationSeconds}s`);
		const normalizedError = normalizeExecError(error, errorPrefix);
		throw new Error(normalizedError);
	}
}

function runCommandCaptureLive(args: {
	command: string;
	errorPrefix: string;
	startedAt: number;
}): string {
	const { command, errorPrefix, startedAt } = args;
	const liveOutputFilePath = path.join(
		os.tmpdir(),
		`code-review-harness-live-output-${Date.now()}-${Math.random().toString(16).slice(2)}.log`
	);

	const wrappedCommand = `set -o pipefail; ${command} 2>&1 | tee ${shellQuote(liveOutputFilePath)}`;

	try {
		execSync(wrappedCommand, {
			encoding: 'utf-8',
			stdio: 'inherit',
			env: process.env,
			shell: '/bin/bash',
		});

		const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
		printProgress(`Command completed in ${durationSeconds}s`);

		if (!fs.existsSync(liveOutputFilePath)) {
			return '(live output streamed; no captured output file was produced)';
		}

		return redactSensitiveText(fs.readFileSync(liveOutputFilePath, 'utf-8'));
	} catch (error) {
		const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
		printProgress(`Command failed after ${durationSeconds}s`);

		const capturedOutput = fs.existsSync(liveOutputFilePath)
			? redactSensitiveText(fs.readFileSync(liveOutputFilePath, 'utf-8'))
			: '';

		const normalizedError = normalizeExecError(error, errorPrefix);
		const combinedError = capturedOutput
			? `${normalizedError}\n\nlive-output:\n${capturedOutput}`
			: normalizedError;

		throw new Error(combinedError);
	} finally {
		try {
			if (fs.existsSync(liveOutputFilePath)) {
				fs.rmSync(liveOutputFilePath, { force: true });
			}
		} catch {
			// ignore cleanup errors for temporary output files
		}
	}
}

function normalizeExecError(error: unknown, errorPrefix: string): string {
	if (!error || typeof error !== 'object') {
		return `${errorPrefix}: Unknown execution failure.`;
	}

	const execError = error as {
		message?: string;
		stdout?: string | Buffer;
		stderr?: string | Buffer;
	};

	const stderr = toUtf8String(execError.stderr);
	const stdout = toUtf8String(execError.stdout);

	const details = [
		execError.message ? `message: ${execError.message}` : '',
		stdout ? `stdout:\n${stdout}` : '',
		stderr ? `stderr:\n${stderr}` : '',
	]
		.filter(Boolean)
		.join('\n\n');

	return redactSensitiveText(`${errorPrefix}\n${details}`);
}

function toUtf8String(value: unknown): string {
	if (!value) return '';
	if (typeof value === 'string') return value;
	if (Buffer.isBuffer(value)) return value.toString('utf-8');
	return String(value);
}

function normalizeError(error: unknown): string {
	if (error instanceof Error) return error.message;
	return String(error);
}

function assertSegmentSucceeded(result: SegmentResult, segmentName: string) {
	if (result.ok) return;

	throw new Error(
		`Segment '${segmentName}' failed after ${result.attempts} attempts. ${result.error ?? ''}`
	);
}

function blockDelay(milliseconds: number) {
	const buffer = new SharedArrayBuffer(4);
	const view = new Int32Array(buffer);
	Atomics.wait(view, 0, 0, milliseconds);
}

function sanitizeSegmentName(name: string): string {
	return name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function uniqueStrings(values: string[]): string[] {
	return Array.from(new Set(values));
}

function normalizeWorkspacePath(rawPath: string, workspaceRoot = process.cwd()): string {
	const slashNormalizedPath = rawPath.replace(/\\/g, '/');
	const normalizedRootPath = path.resolve(workspaceRoot).replace(/\\/g, '/');

	if (path.isAbsolute(slashNormalizedPath)) {
		const absolutePath = path.resolve(slashNormalizedPath).replace(/\\/g, '/');
		if (absolutePath.startsWith(`${normalizedRootPath}/`)) {
			return absolutePath.slice(normalizedRootPath.length + 1);
		}

		return absolutePath;
	}

	return slashNormalizedPath.replace(/^\.\//, '');
}

function shellQuote(value: string): string {
	return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function toJson(value: unknown): string {
	return JSON.stringify(value, null, 2);
}

function redactSensitiveText(text: string): string {
	const patterns: RegExp[] = [
		/ghp_[A-Za-z0-9_]{20,}/g,
		/github_pat_[A-Za-z0-9_]{20,}/g,
		/"?_authToken"?\s*[:=]\s*"?[^\s"']+"?/gi,
		/(npm\.pkg\.github\.com\/:_authToken=)[^\s]+/gi,
	];

	return patterns.reduce((current, pattern) => current.replace(pattern, '[REDACTED]'), text);
}

function checkInstructionCompliance(args: {
	targetFilePath: string;
	suggestedTestFilePaths: string[];
}): InstructionViolation[] {
	const filesToCheck = uniqueStrings([args.targetFilePath, ...args.suggestedTestFilePaths]);
	const violations: InstructionViolation[] = [];

	for (const filePath of filesToCheck) {
		const absoluteFilePath = path.resolve(filePath);
		if (!fs.existsSync(absoluteFilePath)) {
			continue;
		}

		const fileContent = fs.readFileSync(absoluteFilePath, 'utf-8');
		const isTestFile = /\.(test|spec)\.[jt]sx?$/.test(filePath);

		for (const ruleCheck of getBaseInstructionRuleChecks()) {
			violations.push(
				...findRuleViolations({
					filePath,
					fileContent,
					ruleCheck,
					instructionsSource: '.github/copilot-instructions.md',
				})
			);
		}

		if (isTestFile) {
			for (const ruleCheck of getTestInstructionRuleChecks()) {
				violations.push(
					...findRuleViolations({
						filePath,
						fileContent,
						ruleCheck,
						instructionsSource: '.github/instructions/test-files.instructions.md',
					})
				);
			}

			const asyncTestExists = /(it|test)\s*\(\s*['"`][^\n]*['"`]\s*,\s*async\s*\(/.test(fileContent);
			const hasExplicitAssertionCount = /expect\.assertions\s*\(\s*\d+\s*\)/.test(fileContent);

			if (asyncTestExists && !hasExplicitAssertionCount) {
				violations.push({
					filePath,
					line: 1,
					ruleId: 'test-async-expect-assertions-required',
					description:
						'Async tests must declare expect.assertions(n) at the start of the async test body.',
					instructionsSource: '.github/instructions/test-files.instructions.md',
					matchText: 'async test found without expect.assertions(n)',
				});
			}
		}
	}

	return violations;
}

function getBaseInstructionRuleChecks(): Array<{
	ruleId: string;
	description: string;
	pattern: RegExp;
}> {
	return [
		{
			ruleId: 'copilot-no-react-suspense-direct',
			description: 'Do not use React.Suspense or Suspense directly; use SuspenseBoundary/Suspense$.',
			pattern: /\bReact\.Suspense\b|<\s*Suspense\b/g,
		},
		{
			ruleId: 'copilot-no-react-use-direct',
			description: 'Do not use React.use directly; use boundary-aware use$ patterns.',
			pattern: /\bReact\.use\s*\(/g,
		},
		{
			ruleId: 'copilot-no-mui-sx-prop',
			description: 'MUI sx prop is banned by repository rules.',
			pattern: /\bsx\s*=\s*\{/g,
		},
		{
			ruleId: 'copilot-no-mui-grid',
			description: 'MUI Grid is banned; use Tailwind flex/grid utilities.',
			pattern: /<\s*Grid\b/g,
		},
		{
			ruleId: 'copilot-no-tailwind-group-class',
			description: 'Tailwind group class usage is banned.',
			pattern: /className\s*=\s*['"`][^'"`]*\bgroup\b[^'"`]*['"`]/g,
		},
		{
			ruleId: 'copilot-no-display-none-hiding',
			description: 'Do not hide components with display:none; use Activity mode handling.',
			pattern: /display\s*:\s*['"`]none['"`]/g,
		},
		{
			ruleId: 'copilot-no-nested-try-catch',
			description: 'Nested try/catch blocks are banned; prefer linear tryCatch helper patterns.',
			pattern: /try[\s\S]{0,1200}catch[\s\S]{0,1200}try/g,
		},
	];
}

function getTestInstructionRuleChecks(): Array<{
	ruleId: string;
	description: string;
	pattern: RegExp;
}> {
	return [
		{
			ruleId: 'test-no-snapshot-tests',
			description: 'Snapshot assertions are banned in test files.',
			pattern: /toMatchSnapshot\s*\(|toMatchInlineSnapshot\s*\(/g,
		},
		{
			ruleId: 'test-no-mocked-cast',
			description: 'as Mocked<...> casting is banned; use vi.mocked(...) for typed mocks.',
			pattern: /as\s+Mocked\s*</g,
		},
		{
			ruleId: 'test-no-settimeout',
			description: 'setTimeout is banned for async test synchronization.',
			pattern: /\bsetTimeout\s*\(/g,
		},
		{
			ruleId: 'test-no-waitfortimeout',
			description: 'waitForTimeout is banned for async test synchronization.',
			pattern: /\bwaitForTimeout\s*\(/g,
		},
		{
			ruleId: 'test-no-global-cleanup-boilerplate',
			description:
				'Do not call global cleanup boilerplate in test files; it is already provided by global setup.',
			pattern:
				/\bcleanup\s*\(|\bvi\.clearAllMocks\s*\(|\bvi\.restoreAllMocks\s*\(|\bvi\.unstubAllGlobals\s*\(|\bcancelablePromiseTracker\.mockClear\s*\(|\bsetupResizeObserverMock\s*\(|\bsetupScrollIntoViewMock\s*\(|\bsetupHtmlMediaElementGuards\s*\(|\bsetupHtmlCanvasElementGuards\s*\(|\bsetupCancelablePromiseHook\s*\(/g,
		},
	];
}

function findRuleViolations(args: {
	filePath: string;
	fileContent: string;
	ruleCheck: { ruleId: string; description: string; pattern: RegExp };
	instructionsSource: string;
}): InstructionViolation[] {
	const { filePath, fileContent, ruleCheck, instructionsSource } = args;
	const violations: InstructionViolation[] = [];

	for (const match of fileContent.matchAll(ruleCheck.pattern)) {
		const matchText = match[0] ?? '';
		const matchIndex = match.index ?? 0;

		violations.push({
			filePath,
			line: lineFromIndex(fileContent, matchIndex),
			ruleId: ruleCheck.ruleId,
			description: ruleCheck.description,
			instructionsSource,
			matchText,
		});
	}

	return violations;
}

function lineFromIndex(fileContent: string, index: number): number {
	const safeIndex = Math.max(index, 0);
	return fileContent.slice(0, safeIndex).split('\n').length;
}

function buildInstructionViolationError(violations: InstructionViolation[]): string {
	const maxViolationsToPrint = 30;
	const lines = violations.slice(0, maxViolationsToPrint).map((violation) => {
		return [
			`ruleId=${violation.ruleId}`,
			`source=${violation.instructionsSource}`,
			`file=${violation.filePath}`,
			`line=${violation.line}`,
			`description=${violation.description}`,
			`match=${violation.matchText}`,
		].join(' | ');
	});

	if (violations.length > maxViolationsToPrint) {
		lines.push(`...and ${violations.length - maxViolationsToPrint} additional violation(s).`);
	}

	return `Instruction compliance failed (${violations.length} violation(s)).\n${lines.join('\n')}`;
}

main();
