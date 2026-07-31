#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

type TargetMode = 'whole-file' | 'current-changes';

type CodeReviewConfig = {
  targetMode: TargetMode;
  coverageThreshold: number;
  maxRetriesFile: number;
  maxRetriesSegment: number;
  maxRetriesGlobal: number;
  aiCommand: string;
  aiAutofixCommand?: string;
  monitoringDirectory?: string;
};

const DEFAULT_CONFIG_FILE_PATH = 'codeReview.config.json';

function main() {
  const commandLineArguments = process.argv.slice(2);
  const [scopePathOrHelpFlag] = commandLineArguments;

  if (!scopePathOrHelpFlag || scopePathOrHelpFlag === '-h' || scopePathOrHelpFlag === '--help') {
    printHelp();
    process.exit(0);
  }

  const codeReviewConfig = loadConfig();
  const normalizedScopePath = normalizePath(scopePathOrHelpFlag);
  const scopeType = inferScopeType(normalizedScopePath);

  const codeReviewHarnessCommand = buildCodeReviewHarnessCommand({
    scopeType,
    scopeValue: normalizedScopePath,
    codeReviewConfig,
  });

  console.log('\nRunning code review harness with config file...\n');
  console.log(`Scope path: ${normalizedScopePath}`);
  console.log(`Resolved scope type: ${scopeType}`);
  console.log(`Target mode: ${codeReviewConfig.targetMode}`);
  console.log('');

  execSync(codeReviewHarnessCommand, {
    stdio: 'inherit',
    env: process.env,
  });
}

function printHelp() {
  console.log('Usage:');
  console.log('  yarn code-review <path-to-file-or-folder>');
  console.log('');
  console.log('Examples:');
  console.log('  yarn code-review libs/common/src/helpers/decodeJwt/decodeJwt.ts');
  console.log('  yarn code-review backend/routes/video');
  console.log('');
  console.log(`Config file: ${DEFAULT_CONFIG_FILE_PATH}`);
}

function loadConfig(): CodeReviewConfig {
  const configFilePath = path.resolve(DEFAULT_CONFIG_FILE_PATH);

  if (!fs.existsSync(configFilePath)) {
    throw new Error(
      `Missing config file: ${DEFAULT_CONFIG_FILE_PATH}. Create it at repository root before running code-review.`
    );
  }

  const rawContent = fs.readFileSync(configFilePath, 'utf-8');
  const parsed = JSON.parse(rawContent) as Partial<CodeReviewConfig>;

  if (parsed.targetMode !== 'whole-file' && parsed.targetMode !== 'current-changes') {
    throw new Error('codeReview.config.json: targetMode must be whole-file or current-changes.');
  }

  if (typeof parsed.coverageThreshold !== 'number' || parsed.coverageThreshold <= 0) {
    throw new Error('codeReview.config.json: coverageThreshold must be a positive number.');
  }

  if (!isNonNegativeInteger(parsed.maxRetriesFile)) {
    throw new Error('codeReview.config.json: maxRetriesFile must be a non-negative integer.');
  }

  if (!isNonNegativeInteger(parsed.maxRetriesSegment)) {
    throw new Error('codeReview.config.json: maxRetriesSegment must be a non-negative integer.');
  }

  if (!isNonNegativeInteger(parsed.maxRetriesGlobal)) {
    throw new Error('codeReview.config.json: maxRetriesGlobal must be a non-negative integer.');
  }

  if (typeof parsed.aiCommand !== 'string' || parsed.aiCommand.trim() === '') {
    throw new Error('codeReview.config.json: aiCommand must be a non-empty string.');
  }

  return {
    targetMode: parsed.targetMode,
    coverageThreshold: parsed.coverageThreshold,
    maxRetriesFile: parsed.maxRetriesFile,
    maxRetriesSegment: parsed.maxRetriesSegment,
    maxRetriesGlobal: parsed.maxRetriesGlobal,
    aiCommand: parsed.aiCommand,
    aiAutofixCommand: parsed.aiAutofixCommand,
    monitoringDirectory: parsed.monitoringDirectory,
  };
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function inferScopeType(scopePath: string): 'file' | 'folder' {
  const absoluteScopePath = path.resolve(scopePath);

  if (!fs.existsSync(absoluteScopePath)) {
    throw new Error(`Scope path does not exist: ${scopePath}`);
  }

  const pathStats = fs.statSync(absoluteScopePath);

  if (pathStats.isFile()) {
    return 'file';
  }

  if (pathStats.isDirectory()) {
    return 'folder';
  }

  throw new Error(`Scope path must be a file or folder: ${scopePath}`);
}

function buildCodeReviewHarnessCommand(args: {
  scopeType: 'file' | 'folder';
  scopeValue: string;
  codeReviewConfig: CodeReviewConfig;
}): string {
  const { scopeType, scopeValue, codeReviewConfig } = args;

  const commandParts = [
    'yarn code-review:harness',
    `--scope-type ${scopeType}`,
    `--scope-value ${shellQuote(scopeValue)}`,
    `--target-mode ${codeReviewConfig.targetMode}`,
    `--coverage-threshold ${codeReviewConfig.coverageThreshold}`,
    `--max-retries-file ${codeReviewConfig.maxRetriesFile}`,
    `--max-retries-segment ${codeReviewConfig.maxRetriesSegment}`,
    `--max-retries-global ${codeReviewConfig.maxRetriesGlobal}`,
    `--ai-command ${shellQuote(codeReviewConfig.aiCommand)}`,
  ];

  if (codeReviewConfig.aiAutofixCommand) {
    commandParts.push(`--ai-autofix-command ${shellQuote(codeReviewConfig.aiAutofixCommand)}`);
  }

  if (codeReviewConfig.monitoringDirectory) {
    commandParts.push(`--monitoring-dir ${shellQuote(codeReviewConfig.monitoringDirectory)}`);
  }

  return commandParts.join(' ');
}

function normalizePath(rawPath: string): string {
  return rawPath.replace(/^\.\//, '').replace(/\\/g, '/');
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

main();
