function validateVersionSync(args: { manifestVersion: string; packageVersion: string }): void {
  const { manifestVersion, packageVersion } = args;

  if (manifestVersion !== packageVersion) {
    console.error(
      `manifest.json version "${manifestVersion}" must match package.json version "${packageVersion}"`
    );
    process.exit(1);
  }
}

export default validateVersionSync;
