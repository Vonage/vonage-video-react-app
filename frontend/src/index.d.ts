declare module 'ua-parser-js' {
  export interface BrowserInfo {
    name?: string;
    version?: string;
    major?: string;
  }

  export interface CPUInfo {
    architecture?: string;
  }

  export interface DeviceInfo {
    model?: string;
    vendor?: string;
    type?: string;
  }

  export interface EngineInfo {
    name?: string;
    version?: string;
  }

  export interface OSInfo {
    name?: string;
    version?: string;
  }

  export interface UAResult {
    ua: string;
    browser: BrowserInfo;
    engine: EngineInfo;
    os: OSInfo;
    device: DeviceInfo;
    cpu: CPUInfo;
  }

  export class UAParser {
    constructor(ua?: string);
    constructor(options?: object);

    getUA(): string;
    setUA(ua: string): this;

    getBrowser(): BrowserInfo;
    getCPU(): CPUInfo;
    getDevice(): DeviceInfo;
    getEngine(): EngineInfo;
    getOS(): OSInfo;
    getResult(): UAResult;

    static VERSION: string;
    static BROWSER: Record<string, string>;
    static CPU: Record<string, string>;
    static DEVICE: Record<string, string>;
    static ENGINE: Record<string, string>;
    static OS: Record<string, string>;
  }

  export default UAParser;
}
