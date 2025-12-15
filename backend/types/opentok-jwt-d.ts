declare module 'opentok-jwt' {
  export function projectToken(apiKey: string, apiSecret: string, expire?: number): string;
}
