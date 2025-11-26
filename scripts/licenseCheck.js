/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
const fs = require('fs');

const allowlistData = JSON.parse(fs.readFileSync('scripts/licenseAllowList.json', 'utf8'));
const allLicenseData = JSON.parse(fs.readFileSync('scripts/allLicenseResults.json', 'utf8'));

const allowedLicenses = new Set(allowlistData.allowedLicenses);
const ignoredDependencies = new Set(allowlistData.ignoreDependencies);

const isLicenseAllowed = (license) => {
  // Remove any surrounding parentheses and whitespace
  const sanitizedLicense = license.replace(/[()]/g, '').trim();

  // If it's a single license (e.g., "MIT"), check directly
  if (!sanitizedLicense.includes(' OR ') && !sanitizedLicense.includes(' AND ')) {
    return allowedLicenses.has(sanitizedLicense);
  }

  // Split license expression by ' OR ' (for OR conditions)
  if (sanitizedLicense.includes(' OR ')) {
    const licenseParts = sanitizedLicense.split(' OR ').map((part) => part.trim());
    return licenseParts.some((part) => allowedLicenses.has(part));
  }

  // Split license expression by ' AND ' (for AND conditions)
  if (sanitizedLicense.includes(' AND ')) {
    const licenseParts = sanitizedLicense.split(' AND ').map((part) => part.trim());
    return licenseParts.every((part) => allowedLicenses.has(part));
  }

  return false;
};

// Extract the dependency name without version
const getDependencyName = (dependency) => {
  if (dependency.startsWith('@')) {
    // For scoped packages like "@vonage/client-sdk-video@2.28.4", split by the second '@'
    return dependency.split('@').slice(0, 2).join('@');
  } else {
    // For regular packages like "lodash@4.17.21", split by the first '@'
    return dependency.split('@')[0];
  }
};

// Filter dependencies with non-allowed licenses
const nonAllowedDependencies = Object.entries(allLicenseData).reduce(
  (result, [dependency, details]) => {
    const depName = getDependencyName(dependency);
    const licenseType = details.licenses;

    const isIgnored = ignoredDependencies.has(depName);
    const licenseCheck = isLicenseAllowed(licenseType);

    if (!isIgnored && !licenseCheck) {
      result[dependency] = details;
    }

    return result;
  },
  {}
);

if (Object.keys(nonAllowedDependencies).length > 0) {
  console.log('Dependencies with non-allowed licenses:');
  console.table(nonAllowedDependencies);

  console.error('Error: There are dependencies with non-allowed licenses. Failing the job.');
  process.exit(1);
} else {
  console.log('All dependencies have allowed licenses. Job passed.');
}
