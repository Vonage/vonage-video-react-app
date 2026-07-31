#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'node:fs';
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

const PROJECT_ROOTS: Record<Exclude<ProjectName, 'unknown'>, string> = {
	backend: 'backend',
	frontend: 'frontend',
	'integration-tests': 'integration-tests',
	api: 'libs/api',
	core: 'libs/core',
	ui: 'libs/ui',
	common: 'libs/common',
};

const DEFAULT_MONITORING_DIRECTORY = '_testMonitoring/addTestCoverage';

let globalSegmentCounter = 0;

function main() {
	const options = parseOptions(process.argv.slice(2));
	const monitoringDirectory = recreateMonitoringDirectory(options.monitoringDirectory);
	const normalizedOptions: HarnessOptions = {
		...options,
		monitoringDirectory,
	};

	printHeader(normalizedOptions);

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

	const parsedFilterResult = JSON.parse(classificationResult.output) as {
		testableFiles: FileClassification[];
		excludedFiles: ExcludedFile[];
	};

	if (parsedFilterResult.testableFiles.length === 0) {
		console.log('\nNo testable files found after filtering. Exiting successfully.\n');
		process.exit(0);
	}

	runScopeQualityGates({
		options: normalizedOptions,
		resolvedScope,
		testableFiles: parsedFilterResult.testableFiles,
	});

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

	const hasFailures = iterationResult.some((item) => item.status === 'failed');

	if (hasFailures) {
		console.error('\nHarness finished with failures. See monitoring reports for details.\n');
		process.exit(1);
	}

	console.log('\nHarness finished successfully.\n');
}

function printHeader(options: HarnessOptions) {
	console.log('\n=== Add Test Coverage Harness ===\n');
	console.log(`Scope type: ${options.scopeType}`);
	console.log(`Scope value: ${options.scopeValue ?? '(none)'}`);
	console.log(`Target mode: ${options.targetMode}`);
	console.log(`Coverage threshold: ${options.coverageThreshold}`);
	console.log(`Dry run: ${options.dryRun ? 'true' : 'false'}`);
	console.log(`Monitoring directory: ${options.monitoringDirectory}\n`);
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
	const dryRun = parsed['dry-run'] === 'true' || parsed['dry-run'] === undefined
		? parsed['dry-run'] === 'true' || argumentsList.includes('--dry-run')
		: false;
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
	console.log('  yarn add-test-coverage --scope-type <type> [options]');
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
	console.log('  --monitoring-dir <path>                     Default: _testMonitoring/addTestCoverage');
	console.log('  --dry-run                                   Plan and validate only');
	console.log('  --verbose                                   Print full command output');
	console.log('');
	console.log('Examples:');
	console.log('  yarn add-test-coverage --scope-type working-tree --target-mode current-changes --dry-run');
	console.log('  yarn add-test-coverage --scope-type file --scope-value backend/routes/video/video.ts --target-mode whole-file --dry-run');
	console.log('  yarn add-test-coverage --scope-type commit --scope-value <sha> --target-mode current-changes --ai-command "copilot"');
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
	const candidateFiles = (() => {
		if (options.scopeType === 'working-tree') {
			if (options.targetMode === 'whole-file') {
				return uniqueStrings(getWorkingTreeChangedFiles());
			}

			return uniqueStrings(getWorkingTreeChangedFiles());
		}

		if (options.scopeType === 'commit') {
			const commitFiles = getCommitChangedFiles(options.scopeValue as string);
			if (options.targetMode === 'whole-file') {
				return uniqueStrings(commitFiles);
			}

			return uniqueStrings(commitFiles);
		}

		if (options.scopeType === 'file') {
			const normalizedFilePath = normalizeWorkspacePath(options.scopeValue as string);
			if (!fs.existsSync(path.resolve(normalizedFilePath))) {
				throw new Error(`Scope file does not exist: ${normalizedFilePath}`);
			}

			if (options.targetMode === 'whole-file') {
				return [normalizedFilePath];
			}

			const hasChanges = getWorkingTreeChangedFiles().includes(normalizedFilePath);
			return hasChanges ? [normalizedFilePath] : [];
		}

		if (options.scopeType === 'folder') {
			const folderPath = normalizeWorkspacePath(options.scopeValue as string);
			const folderAbsolutePath = path.resolve(folderPath);
			if (!fs.existsSync(folderAbsolutePath)) {
				throw new Error(`Scope folder does not exist: ${folderPath}`);
			}

			if (options.targetMode === 'whole-file') {
				return getTrackedFilesUnderPath(folderPath);
			}

			const changedFiles = getWorkingTreeChangedFiles();
			return changedFiles.filter((filePath) => filePath.startsWith(`${folderPath}/`));
		}

		return [];
	})();

	const changedFiles = (() => {
		if (options.scopeType === 'commit') {
			return uniqueStrings(getCommitChangedFiles(options.scopeValue as string));
		}

		return uniqueStrings(getWorkingTreeChangedFiles());
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

	const prettierCommand = `yarn prettier --check ${qualityTargetFiles.map(shellQuote).join(' ')}`;
	const eslintCommand = `yarn eslint ${qualityTargetFiles.map(shellQuote).join(' ')}`;

	const impactedProjects = uniqueStrings(
		testableFiles
			.map((entry) => entry.projectName)
			.filter((projectName): projectName is Exclude<ProjectName, 'unknown'> => projectName !== 'unknown')
	);

	const tsCheckCommand = `yarn nx run-many -t ts-check -p ${impactedProjects.join(',')}`;

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

			return runCommandCapture(command, `${segmentName} failed`);
		},
	});

	assertSegmentSucceeded(segmentResult, segmentName);
}

function processFilesSequentially(args: {
	options: HarnessOptions;
	resolvedScope: ResolvedScope;
	testableFiles: FileClassification[];
}): Array<{ filePath: string; status: 'skipped' | 'passed' | 'failed'; reason: string }> {
	const { options, resolvedScope, testableFiles } = args;
	const fileResults: Array<{ filePath: string; status: 'skipped' | 'passed' | 'failed'; reason: string }> = [];
	let globalRetriesRemaining = options.maxRetriesGlobal;

	for (const fileClassification of testableFiles) {
		const { filePath } = fileClassification;

		if (options.targetMode === 'current-changes' && !resolvedScope.changedFiles.includes(filePath)) {
			fileResults.push({
				filePath,
				status: 'skipped',
				reason: 'not-in-current-changes',
			});
			continue;
		}

		const baselineCoverageResult = runSegmentWithRetry({
			segmentName: `file-baseline-coverage-${sanitizeSegmentName(filePath)}`,
			monitoringDirectory: options.monitoringDirectory,
			maxRetries: options.maxRetriesSegment,
			verbose: options.verbose,
			run: () => {
				return toJson({
					implemented: false,
					reason: 'baseline-coverage-computation-will-be-wired-next',
				});
			},
		});
		assertSegmentSucceeded(baselineCoverageResult, `baseline-coverage-${filePath}`);

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

		let filePassed = false;
		let fileFailedByReason = 'file-retries-exhausted';
		let shouldRetryFromGlobalBudget = true;

		while (shouldRetryFromGlobalBudget) {
			let attemptCounter = 0;
			shouldRetryFromGlobalBudget = false;

			while (attemptCounter <= options.maxRetriesFile) {
				attemptCounter += 1;

				const metadataSegmentName = `file-metadata-${sanitizeSegmentName(filePath)}-attempt-${attemptCounter}`;
				const metadataResult = runSegmentWithRetry({
					segmentName: metadataSegmentName,
					monitoringDirectory: options.monitoringDirectory,
					maxRetries: options.maxRetriesSegment,
					verbose: options.verbose,
					run: () => runMetadataStep({ fileClassification, options }),
				});

				if (!metadataResult.ok) {
					fileFailedByReason = 'metadata-step-failed';
					if (attemptCounter > options.maxRetriesFile) {
						break;
					}
					continue;
				}

				const parsedMetadata = JSON.parse(metadataResult.output) as MetadataResponse;
				const simulateLoopResult = runSegmentWithRetry({
					segmentName: `file-iteration-${sanitizeSegmentName(filePath)}-attempt-${attemptCounter}`,
					monitoringDirectory: options.monitoringDirectory,
					maxRetries: options.maxRetriesSegment,
					verbose: options.verbose,
					run: () => {
						return toJson({
							implemented: false,
							message: 'test-generation-and-coverage-recheck-step-will-be-wired-next',
							recommendedTestCommand: parsedMetadata.recommendedTestCommand,
							recommendedCoverageCommand: parsedMetadata.recommendedCoverageCommand,
						});
					},
				});

				if (!simulateLoopResult.ok) {
					fileFailedByReason = 'iteration-step-failed';
					if (attemptCounter > options.maxRetriesFile) {
						break;
					}
					continue;
				}

				filePassed = true;
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
				reason: 'metadata-step-successful',
			});
			continue;
		}

		fileResults.push({
			filePath,
			status: 'failed',
			reason: fileFailedByReason,
		});
	}

	return fileResults;
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

	const aiCommandLine = `${options.aiCommand} ${shellQuote(requestFilePath)} ${shellQuote(responseFilePath)}`;
	runCommandCapture(aiCommandLine, `AI metadata command failed for ${fileClassification.filePath}.`);

	if (!fs.existsSync(responseFilePath)) {
		throw new Error(`AI metadata response file was not created: ${responseFilePath}`);
	}

	const responseRaw = fs.readFileSync(responseFilePath, 'utf-8');
	const parsed = JSON.parse(responseRaw) as MetadataResponse;
	validateMetadataResponse(parsed, fileClassification.filePath);

	return toJson(parsed);
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
		output || '(empty)',
		'```',
	];

	if (error) {
		lines.push('');
		lines.push('## Error');
		lines.push('');
		lines.push('```text');
		lines.push(error);
		lines.push('```');
	}

	fs.writeFileSync(reportPath, lines.join('\n'), 'utf-8');
}

function runCommandCapture(command: string, errorPrefix: string): string {
	try {
		const output = execSync(command, {
			encoding: 'utf-8',
			stdio: ['pipe', 'pipe', 'pipe'],
			env: process.env,
		});

		return output;
	} catch (error) {
		const normalizedError = normalizeExecError(error, errorPrefix);
		throw new Error(normalizedError);
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

	return `${errorPrefix}\n${details}`;
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
	const finishAt = Date.now() + milliseconds;

	while (Date.now() < finishAt) {
		// Busy wait intentionally for deterministic retry delays in a short-lived CLI script.
	}
}

function sanitizeSegmentName(name: string): string {
	return name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function uniqueStrings(values: string[]): string[] {
	return Array.from(new Set(values));
}

function normalizeWorkspacePath(rawPath: string): string {
	return rawPath.replace(/^\.\//, '').replace(/\\/g, '/');
}

function shellQuote(value: string): string {
	return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function toJson(value: unknown): string {
	return JSON.stringify(value, null, 2);
}

main();
