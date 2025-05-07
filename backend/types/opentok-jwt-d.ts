declare module 'opentok-jwt' {
  // eslint-disable-next-line import/prefer-default-export
  export function projectToken(apiKey: string, apiSecret: string, expire?: number): string;
}
