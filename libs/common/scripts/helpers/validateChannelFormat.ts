function validateChannelFormat(args: { version: string; channel: string }): void {
  const { version, channel } = args;

  const isLatestValid = channel === 'latest' && /^\d+\.\d+\.\d+$/.test(version);
  const isBetaValid = channel === 'beta' && /^\d+\.\d+\.\d+-beta\.\d+$/.test(version);

  if (!isLatestValid && !isBetaValid) {
    const expectedExample = channel === 'beta' ? '"1.2.0-beta.0"' : '"1.2.0"';
    console.error(
      `Version "${version}" does not match expected format for channel "${channel}" — expected e.g. ${expectedExample}`
    );
    process.exit(1);
  }
}

export default validateChannelFormat;
