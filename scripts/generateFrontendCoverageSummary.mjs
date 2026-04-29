import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_OUTPUT_PATH = 'FRONTEND_TEST_COVERAGE_SUMMARY.md';

const cliArguments = process.argv.slice(2);
const outputPath = cliArguments[0] ?? DEFAULT_OUTPUT_PATH;

const repositoryRootPath = process.cwd();
const frontendSourcePath = path.join(repositoryRootPath, 'frontend', 'src');
const hooksSourcePath = path.join(frontendSourcePath, 'hooks');
const apiSourcePath = path.join(frontendSourcePath, 'api');
const e2eTestsPath = path.join(repositoryRootPath, 'integration-tests', 'tests');
const playwrightConfigPath = path.join(repositoryRootPath, 'integration-tests', 'playwright.config.ts');

const walkDirectory = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return walkDirectory(entryPath);
    }

    return [entryPath];
  });
};

const countMatches = ({ content, expression }) => {
  const matches = content.match(expression);
  return matches ? matches.length : 0;
};

const toRelativePath = (absolutePath) => path.relative(repositoryRootPath, absolutePath).replaceAll('\\', '/');

const isScriptFile = (filePath) => ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(path.extname(filePath));

const isTestFile = (filePath) =>
  filePath.includes('/tests/') || filePath.includes('.spec.') || filePath.includes('.test.');

const parseHookName = ({ filePath, content }) => {
  const exportDefaultMatch = content.match(/export\s+default\s+(use[A-Za-z0-9_]+)/);
  if (exportDefaultMatch && exportDefaultMatch[1]) {
    return exportDefaultMatch[1];
  }

  const functionMatch = content.match(/(?:const|function)\s+(use[A-Za-z0-9_]+)/);
  if (functionMatch && functionMatch[1]) {
    return functionMatch[1];
  }

  return path.basename(filePath, path.extname(filePath));
};

const parseApiName = ({ filePath, content }) => {
  const namedExportMatch = content.match(/export\s+(?:const|async\s+function|function)\s+([A-Za-z0-9_]+)/);
  if (namedExportMatch && namedExportMatch[1]) {
    return namedExportMatch[1];
  }

  const exportDefaultFunctionMatch = content.match(/export\s+default\s+async\s+function\s+([A-Za-z0-9_]+)/);
  if (exportDefaultFunctionMatch && exportDefaultFunctionMatch[1]) {
    return exportDefaultFunctionMatch[1];
  }

  return path.basename(filePath, path.extname(filePath));
};

const collectHookInventory = () => {
  const allHookFiles = walkDirectory(hooksSourcePath).filter((filePath) => {
    if (!isScriptFile(filePath)) {
      return false;
    }

    if (isTestFile(filePath)) {
      return false;
    }

    const fileName = path.basename(filePath);
    return fileName.startsWith('use');
  });

  return allHookFiles.map((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const hookName = parseHookName({ filePath, content });

    return {
      functionName: hookName,
      functionType: 'Hook',
      filePath: toRelativePath(filePath),
      sourceContent: content,
    };
  });
};

const collectApiInventory = () => {
  const apiFiles = walkDirectory(apiSourcePath).filter((filePath) => {
    if (!isScriptFile(filePath)) {
      return false;
    }

    return !isTestFile(filePath);
  });

  return apiFiles.map((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const apiName = parseApiName({ filePath, content });

    return {
      functionName: apiName,
      functionType: 'API',
      filePath: toRelativePath(filePath),
      sourceContent: content,
    };
  });
};

const collectE2eMetrics = () => {
  const suiteFiles = walkDirectory(e2eTestsPath)
    .filter((filePath) => filePath.endsWith('.spec.ts'))
    .map((filePath) => toRelativePath(filePath));

  const suiteMetrics = suiteFiles.map((suiteFilePath) => {
    const absoluteSuitePath = path.join(repositoryRootPath, suiteFilePath);
    const content = fs.readFileSync(absoluteSuitePath, 'utf8');
    const caseCount = countMatches({
      content,
      expression: /\btest(?:\.only|\.skip)?\s*\(\s*['"`]/g,
    });

    return {
      suiteFilePath,
      suiteName: path.basename(suiteFilePath),
      caseCount,
    };
  });

  const totalCaseCount = suiteMetrics.reduce((total, suiteMetric) => total + suiteMetric.caseCount, 0);

  return {
    suiteMetrics,
    totalSuiteCount: suiteMetrics.length,
    totalCaseCount,
  };
};

const collectBrowserProjectCount = () => {
  if (!fs.existsSync(playwrightConfigPath)) {
    return 0;
  }

  const playwrightConfigContent = fs.readFileSync(playwrightConfigPath, 'utf8');
  return countMatches({
    content: playwrightConfigContent,
    expression: /\bname\s*:\s*['"][^'"]+['"]/g,
  });
};

const buildE2eCoverageMap = () => {
  // This is a deterministic heuristic map that links suite names to frontend functions.
  return {
    'landing.spec.ts': ['useRoomName', 'useWaitingRoom', 'fetchCredentials'],
    'waitingRoom.spec.ts': ['useWaitingRoom', 'usePublisherContext', 'usePreviewPublisherContext'],
    'meetingroom.spec.ts': ['useMeetingRoom', 'useSessionContext', 'usePermissions'],
    'multiparty.spec.ts': ['useMeetingRoom', 'useLayoutManager', 'useSubscribersInDisplayOrder'],
    'activeSpeaker.spec.ts': ['useActiveSpeaker', 'useLayoutManager', 'useAudioLevels'],
    'pinning.spec.ts': ['useLayoutManager', 'useRightPanel', 'useSubscribersInDisplayOrder'],
    'chat.spec.ts': ['useChat', 'useSessionContext', 'useRightPanel', 'useUserContext'],
    'recording.spec.ts': ['useMeetingRoom', 'useArchives', 'archiving'],
    'reportIssue.spec.ts': ['reportFeedback', 'useCollectBrowserInformation'],
    'goodbye.spec.ts': ['useGoodByePage', 'useArchives'],
    'visualComparisons.spec.ts': ['useRoomName'],
  };
};

const assignCoverage = ({ functionInventory, suiteMetrics }) => {
  const e2eCoverageMap = buildE2eCoverageMap();

  return functionInventory.map((functionItem) => {
    const matchedSuites = suiteMetrics
      .filter((suiteMetric) => {
        const functionsForSuite = e2eCoverageMap[suiteMetric.suiteName] ?? [];
        return functionsForSuite.some((functionName) =>
          functionItem.functionName.toLowerCase().includes(functionName.toLowerCase()) ||
          functionName.toLowerCase().includes(functionItem.functionName.toLowerCase())
        );
      })
      .map((suiteMetric) => suiteMetric.suiteName);

    const suiteHitCount = matchedSuites.length;
    const e2eCoverageStatus = (() => {
      if (suiteHitCount === 0) return 'None';
      if (suiteHitCount === 1) return 'Indirect';
      return 'Direct';
    })();

    const riskLevel = (() => {
      if (suiteHitCount === 0) return 'High';
      if (suiteHitCount === 1) return 'Medium';
      return 'Low';
    })();

    const isCriticalGap = suiteHitCount === 0;

    return {
      ...functionItem,
      suiteHitCount,
      matchedSuites,
      e2eCoverageStatus,
      riskLevel,
      isCriticalGap,
      appUsageCountApprox: countMatches({
        content: functionItem.sourceContent,
        expression: /\b(use[A-Za-z0-9_]+|fetch|join|toggle|send|publish|subscribe)\b/g,
      }),
    };
  });
};

const classifyCoverage = ({ suiteHitCount }) => {
  if (suiteHitCount === 0) return 'Untested';
  if (suiteHitCount === 1) return 'Partial';
  return 'Tested';
};

const buildCategorySummary = ({ analyzedFunctions }) => {
  const categories = {
    'Context/State Hooks': (functionItem) =>
      functionItem.functionType === 'Hook' &&
      ['Context', 'Session', 'User', 'Publisher', 'MeetingRoom'].some((token) =>
        functionItem.functionName.includes(token)
      ),
    'Layout/Display Hooks': (functionItem) =>
      functionItem.functionType === 'Hook' &&
      ['Layout', 'Viewport', 'Dimensions', 'Display', 'Window'].some((token) =>
        functionItem.functionName.includes(token)
      ),
    'Chat/Messaging Hooks': (functionItem) =>
      functionItem.functionType === 'Hook' &&
      ['Chat', 'Emoji', 'Captions'].some((token) => functionItem.functionName.includes(token)),
    'Device/Media Hooks': (functionItem) =>
      functionItem.functionType === 'Hook' &&
      ['Audio', 'Video', 'Screen', 'Camera', 'Subscriber', 'Speaking'].some((token) =>
        functionItem.functionName.includes(token)
      ),
    'Room/Navigation Hooks': (functionItem) =>
      functionItem.functionType === 'Hook' &&
      ['Room', 'Waiting', 'GoodBye'].some((token) => functionItem.functionName.includes(token)),
    'UI/Control Hooks': (functionItem) =>
      functionItem.functionType === 'Hook' &&
      ['Toolbar', 'RightPanel', 'Permissions', 'Dropdown', 'PushToTalk'].some((token) =>
        functionItem.functionName.includes(token)
      ),
    'Data/Utility Hooks': (functionItem) =>
      functionItem.functionType === 'Hook' &&
      ['Date', 'Collect', 'Preferred'].some((token) => functionItem.functionName.includes(token)),
    APIs: (functionItem) => functionItem.functionType === 'API',
  };

  return Object.entries(categories).map(([categoryName, categoryMatcher]) => {
    const functionsInCategory = analyzedFunctions.filter(categoryMatcher);
    const totalCount = functionsInCategory.length;

    if (totalCount === 0) {
      return {
        categoryName,
        totalCount,
        testedCount: 0,
        partialCount: 0,
        untestedCount: 0,
        coveragePercent: 0,
      };
    }

    const testedCount = functionsInCategory.filter(
      (functionItem) => classifyCoverage({ suiteHitCount: functionItem.suiteHitCount }) === 'Tested'
    ).length;

    const partialCount = functionsInCategory.filter(
      (functionItem) => classifyCoverage({ suiteHitCount: functionItem.suiteHitCount }) === 'Partial'
    ).length;

    const untestedCount = functionsInCategory.filter(
      (functionItem) => classifyCoverage({ suiteHitCount: functionItem.suiteHitCount }) === 'Untested'
    ).length;

    const weightedCoveragePercent = Math.round(((testedCount + partialCount * 0.5) / totalCount) * 100);

    return {
      categoryName,
      totalCount,
      testedCount,
      partialCount,
      untestedCount,
      coveragePercent: weightedCoveragePercent,
    };
  });
};

const formatMarkdownTable = ({ headerColumns, rows }) => {
  const header = `| ${headerColumns.join(' | ')} |`;
  const divider = `| ${headerColumns.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');

  return [header, divider, body].join('\n');
};

const buildReport = ({
  generatedDate,
  categorySummary,
  analyzedFunctions,
  e2eMetrics,
  browserProjectCount,
  overallCoveragePercent,
  testedCount,
  partialCount,
  untestedCount,
}) => {
  const topTestedFunctions = [...analyzedFunctions]
    .sort((firstItem, secondItem) => secondItem.suiteHitCount - firstItem.suiteHitCount)
    .slice(0, 10);

  const leastTestedFunctions = [...analyzedFunctions]
    .sort((firstItem, secondItem) => firstItem.suiteHitCount - secondItem.suiteHitCount)
    .slice(0, 10);

  const mostUtilizedSuite = [...e2eMetrics.suiteMetrics].sort(
    (firstSuite, secondSuite) => secondSuite.caseCount - firstSuite.caseCount
  )[0];

  const leastUtilizedSuite = [...e2eMetrics.suiteMetrics].sort(
    (firstSuite, secondSuite) => firstSuite.caseCount - secondSuite.caseCount
  )[0];

  const categoryRows = categorySummary.map((categoryItem) => [
    categoryItem.categoryName,
    String(categoryItem.totalCount),
    String(categoryItem.testedCount),
    String(categoryItem.partialCount),
    String(categoryItem.untestedCount),
    `${categoryItem.coveragePercent}%`,
  ]);

  const topTestedRows = topTestedFunctions.map((functionItem, index) => [
    `${index + 1}`,
    `**${functionItem.functionName}**`,
    functionItem.functionType,
    `\`${functionItem.filePath}\``,
    String(functionItem.suiteHitCount),
    functionItem.e2eCoverageStatus,
    functionItem.isCriticalGap ? 'YES' : 'NO',
  ]);

  const leastTestedRows = leastTestedFunctions.map((functionItem, index) => [
    `${index + 1}`,
    functionItem.isCriticalGap
      ? `**${functionItem.functionName}** (CRITICAL)`
      : `**${functionItem.functionName}**`,
    functionItem.functionType,
    `\`${functionItem.filePath}\``,
    String(functionItem.suiteHitCount),
    functionItem.riskLevel,
    functionItem.isCriticalGap ? 'YES' : 'NO',
  ]);

  const highlightedFunctionRows = analyzedFunctions
    .slice()
    .sort((firstItem, secondItem) => {
      if (firstItem.isCriticalGap === secondItem.isCriticalGap) {
        return firstItem.functionName.localeCompare(secondItem.functionName);
      }

      return firstItem.isCriticalGap ? -1 : 1;
    })
    .map((functionItem) => [
      functionItem.isCriticalGap
        ? `**${functionItem.functionName}** (CRITICAL)`
        : `**${functionItem.functionName}**`,
      functionItem.functionType,
      `\`${functionItem.filePath}\``,
      String(functionItem.suiteHitCount),
      functionItem.e2eCoverageStatus,
      functionItem.riskLevel,
      functionItem.isCriticalGap ? 'YES' : 'NO',
    ]);

  const criticalGaps = [
    '- [CRITICAL] Error handling scenarios are not inferred from static suite mapping and should be validated with explicit failure-path tests.',
    '- [CRITICAL] Function-to-suite coverage is heuristic and may miss indirect runtime paths.',
  ];

  if (untestedCount > 0) {
    criticalGaps.push(`- [CRITICAL] Untested (0%): ${untestedCount} functions need at least one mapped e2e path.`);
  }

  return `# Frontend Test Coverage Summary - Auto Generated\n\n**Generated:** ${generatedDate}  \n**Total Analytics:** ${analyzedFunctions.filter((functionItem) => functionItem.functionType === 'Hook').length} Hooks + ${analyzedFunctions.filter((functionItem) => functionItem.functionType === 'API').length} APIs analyzed  \n**E2E Test Suites:** ${e2eMetrics.totalSuiteCount} files with ~${e2eMetrics.totalCaseCount} test cases  \n**Overall Coverage:** **${overallCoveragePercent}%**\n\n---\n\n## Coverage Breakdown\n\n### By Function Type\n${formatMarkdownTable({
  headerColumns: ['Category', 'Total', 'Tested', 'Partial', 'Untested', 'Coverage'],
  rows: categoryRows,
})}\n\n### By Browser\n- Browser projects in Playwright config: ${browserProjectCount}\n\n---\n\n## Top 10 Most-Tested Functions\n${formatMarkdownTable({
  headerColumns: ['#', 'Function', 'Type', 'File', 'Mapped Suites', 'Coverage Mode', 'Critical Gap'],
  rows: topTestedRows,
})}\n\n---\n\n## Top 10 Least-Tested Functions\n${formatMarkdownTable({
  headerColumns: ['#', 'Function', 'Type', 'File', 'Mapped Suites', 'Risk', 'Critical Gap'],
  rows: leastTestedRows,
})}

---

## Highlighted Function List
${formatMarkdownTable({
  headerColumns: ['Function', 'Type', 'File', 'Mapped Suites', 'Coverage Mode', 'Risk', 'Critical Gap'],
  rows: highlightedFunctionRows,
})}

---

## Summary Statistics
- Total frontend functions tracked: ${analyzedFunctions.length}
- Tested (mapped by 2+ suites): ${testedCount}
- Partial (mapped by 1 suite): ${partialCount}
- Untested (0%): ${untestedCount} functions

---

## Critical Gaps
${criticalGaps.join('\n')}

---

## Risk Assessment
- High risk functions: ${analyzedFunctions.filter((functionItem) => functionItem.riskLevel === 'High').length}
- Medium risk functions: ${analyzedFunctions.filter((functionItem) => functionItem.riskLevel === 'Medium').length}
- Low risk functions: ${analyzedFunctions.filter((functionItem) => functionItem.riskLevel === 'Low').length}

---

## Method Notes
- This report is generated by static analysis and deterministic suite-to-function mapping heuristics.
- Runtime behavior can differ from static mapping; use this report as a regression signal, not an absolute runtime truth.\n`;
};

const main = () => {
  const hookInventory = collectHookInventory();
  const apiInventory = collectApiInventory();
  const functionInventory = [...hookInventory, ...apiInventory];

  const e2eMetrics = collectE2eMetrics();
  const browserProjectCount = collectBrowserProjectCount();

  const analyzedFunctions = assignCoverage({
    functionInventory,
    suiteMetrics: e2eMetrics.suiteMetrics,
  });

  const testedCount = analyzedFunctions.filter(
    (functionItem) => classifyCoverage({ suiteHitCount: functionItem.suiteHitCount }) === 'Tested'
  ).length;

  const partialCount = analyzedFunctions.filter(
    (functionItem) => classifyCoverage({ suiteHitCount: functionItem.suiteHitCount }) === 'Partial'
  ).length;

  const untestedCount = analyzedFunctions.filter(
    (functionItem) => classifyCoverage({ suiteHitCount: functionItem.suiteHitCount }) === 'Untested'
  ).length;

  const overallCoveragePercent = analyzedFunctions.length
    ? Math.round(((testedCount + partialCount * 0.5) / analyzedFunctions.length) * 100)
    : 0;

  const categorySummary = buildCategorySummary({ analyzedFunctions });

  const generatedDate = new Date().toISOString().slice(0, 10);

  const reportContent = buildReport({
    generatedDate,
    categorySummary,
    analyzedFunctions,
    e2eMetrics,
    browserProjectCount,
    overallCoveragePercent,
    testedCount,
    partialCount,
    untestedCount,
  });

  fs.writeFileSync(path.join(repositoryRootPath, outputPath), reportContent, 'utf8');

  console.log(`Generated ${outputPath}`);
  console.log(`Functions: ${analyzedFunctions.length}`);
  console.log(`Coverage: ${overallCoveragePercent}%`);
};

main();

