function readCallbackPath({ oidcWebRedirectUri }: { oidcWebRedirectUri: string }): string {
  return new URL(oidcWebRedirectUri).pathname;
}

export default readCallbackPath;
