import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_REPORT_PATH = 'FRONTEND_TEST_COVERAGE_SUMMARY.md';
const cliArguments = process.argv.slice(2);

const resolveReportPaths = () => {
  if (cliArguments.length === 0) {
    return {
      baseReportPath: DEFAULT_REPORT_PATH,
      headReportPath: DEFAULT_REPORT_PATH,
      mode: 'self-check',
    };
  }

  if (cliArguments.length === 1) {
    return {
      baseReportPath: cliArguments[0],
      headReportPath: DEFAULT_REPORT_PATH,
      mode: 'base-vs-local-head',
    };
  }

  return {
    baseReportPath: cliArguments[0],
    headReportPath: cliArguments[1],
    mode: 'explicit-paths',
  };
};

const { baseReportPath, headReportPath, mode } = resolveReportPaths();

if (!baseReportPath || !headReportPath) {
  console.error(
    'Usage: node scripts/checkFrontendCoverageGapRegression.mjs <base-report-path> <head-report-path>'
  );
  process.exit(2);
}

const readReport = (reportPath) => {
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Missing report file: ${reportPath}`);
  }

  return fs.readFileSync(reportPath, 'utf8');
};

const parseMetric = ({ reportContent, expression, metricName, fallbackExpressions = [] }) => {
  const expressionsToTry = [expression, ...fallbackExpressions];

  for (const expressionToTry of expressionsToTry) {
    const match = reportContent.match(expressionToTry);

    if (!match || !match[1]) {
      continue;
    }

    const metricValue = Number.parseFloat(match[1]);

    if (!Number.isNaN(metricValue)) {
      return metricValue;
    }
  }

  throw new Error(`Could not parse metric: ${metricName}`);
};

const countCriticalGaps = (reportContent) => {
  const criticalGapsSectionMatch = reportContent.match(
    /###\s+Critical Gaps([\s\S]*?)(?:\n---|\n##\s|$)/m
  );

  if (!criticalGapsSectionMatch) {
    return 0;
  }

  const criticalGapsSection = criticalGapsSectionMatch[1];

  const explicitGapLines = criticalGapsSection
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.startsWith('[CRITICAL]') ||
        line.startsWith('- [CRITICAL]') ||
        line.startsWith('❌') ||
        line.startsWith('- ❌') ||
        line.includes('NOT TESTED')
    );

  return explicitGapLines.length;
};

const collectCoverageMetrics = (reportContent) => {
  const overallCoveragePercent = parseMetric({
    reportContent,
    expression: /\*\*Overall Coverage:\*\*\s*\*\*(\d+(?:\.\d+)?)%\*\*/,
    fallbackExpressions: [
      /Overall Coverage:\s*\*\*(\d+(?:\.\d+)?)%\*\*/,
      /Overall Coverage\s*[:\-]\s*(\d+(?:\.\d+)?)%/,
      /Coverage\s*[:\-]\s*(\d+(?:\.\d+)?)%/,
    ],
    metricName: 'overall coverage percentage',
  });

  const untestedFunctionCount = parseMetric({
    reportContent,
    expression: /Untested \(0%\):\s*(\d+)\s*functions?/,
    fallbackExpressions: [
      /\*\*Untested \(0%\):\*\*\s*(\d+)\s*functions?/,
      /Untested Features:\s*(\d+)\/(\d+)/,
      /Untested\s*[:\-]\s*(\d+)/,
    ],
    metricName: 'untested function count',
  });

  const criticalGapCount = countCriticalGaps(reportContent);

  return {
    overallCoveragePercent,
    untestedFunctionCount,
    criticalGapCount,
  };
};

const printMetrics = ({ label, metrics }) => {
  console.log(`\n${label}:`);
  console.log(`- Overall coverage: ${metrics.overallCoveragePercent}%`);
  console.log(`- Untested functions: ${metrics.untestedFunctionCount}`);
  console.log(`- Critical gaps: ${metrics.criticalGapCount}`);
};

try {
  if (mode === 'self-check') {
    console.log(
      `No paths provided. Running self-check with ${DEFAULT_REPORT_PATH} for both base and head.`
    );
  }

  const baseReportContent = readReport(baseReportPath);
  const headReportContent = readReport(headReportPath);

  const baseMetrics = collectCoverageMetrics(baseReportContent);
  const headMetrics = collectCoverageMetrics(headReportContent);

  printMetrics({ label: `Base (${path.basename(baseReportPath)})`, metrics: baseMetrics });
  printMetrics({ label: `Head (${path.basename(headReportPath)})`, metrics: headMetrics });

  const failures = [];

  // Validation policy: only critical gaps are enforced as a blocker.
  if (headMetrics.criticalGapCount > baseMetrics.criticalGapCount) {
    failures.push(
      `Critical gaps increased (${baseMetrics.criticalGapCount} -> ${headMetrics.criticalGapCount}).`
    );
  }

  if (failures.length > 0) {
    console.error('\nCoverage gap regression check failed:');
    failures.forEach((failureMessage) => {
      console.error(`- ${failureMessage}`);
    });
    process.exit(1);
  }

  console.log('\nCoverage gap regression check passed. No new critical gaps were introduced.');
} catch (error) {
  console.error(`Coverage gap regression check error: ${error.message}`);
  console.error(
    `Usage: node scripts/checkFrontendCoverageGapRegression.mjs <base-report-path> <head-report-path>`
  );
  console.error(
    `Local self-check: node scripts/checkFrontendCoverageGapRegression.mjs`
  );
  process.exit(2);
}
