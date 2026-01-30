import tryCatch from '@common/execution/tryCatch';
import wait from '@common/execution/wait';
import isPromise from '@common/assertions/isPromise';
import isNil from '@common/assertions/isNil';

export enum LoggerFeature {
  ReportError = 'reportError',
  Log = 'log',
}

export const AnsiColors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
} as const;

export const ColorsPerFeature = {
  [LoggerFeature.ReportError]: AnsiColors.red,
  [LoggerFeature.Log]: AnsiColors.blue,
} as const;

/**
 * Logger provider interface defining the available logger features.
 */
export type LoggerProviderConfig = {
  /**
   * Enables verbose output for the logger provider.
   */
  verbose?: boolean;

  /**
   * Reports an error event to the logger provider.
   */
  [LoggerFeature.ReportError](error: unknown, extra: Record<string, unknown>): void;

  /**
   * Logs an event to the logger provider.
   */
  [LoggerFeature.Log](event: string, extra?: Record<string, unknown>): void;
};

/**
 * Logger base class for error reporting and event logging.
 */
export class LoggerBase implements LoggerProviderConfig {
  /**
   * Indicates whether the lack of a logger provider or one of its features has been acknowledged.
   */
  protected acknowledged: Record<LoggerFeature | 'provider', boolean> = Object.create(null);

  protected error: unknown = null;

  protected provider: Promise<LoggerProviderConfig> | null = null;

  protected onLoggerInitializationFailed(error: unknown) {
    console.error('[Logger] Initialization failed. Logger will be disabled.', error);
  }

  /**
   * Sets up the logger provider.
   * @param callback A callback that returns a LoggerProvider or a Promise that resolves to a LoggerProvider.
   */
  public async setup(callback: () => Promise<LoggerProviderConfig> | LoggerProviderConfig) {
    // prevents the initialization from blocking the main thread
    // logger always has low priority
    await wait(0);

    type SetupResult = { result: LoggerProviderConfig | null; error: unknown };
    let tryCatchResult = tryCatch(() => callback()) as SetupResult | Promise<SetupResult>;
    if (isPromise(tryCatchResult)) {
      tryCatchResult = await tryCatchResult;
    }
    const { result, error } = tryCatchResult;

    if (!result || error) {
      this.error = error ?? new Error('[Logger] Setup callback did not return a provider.');
      return void this.onLoggerInitializationFailed(this.error);
    }

    const isSynchronousProvider = !isPromise(result);

    // return the provider directly if it's synchronous
    if (isSynchronousProvider) {
      this.provider = Promise.resolve(result);
      return;
    }

    // handle asynchronous provider with error reporting
    this.provider = (result as Promise<LoggerProviderConfig>).catch((initError) => {
      this.error = initError;
      this.onLoggerInitializationFailed(this.error);

      throw this.error;
    });
  }

  protected logLoggerEvent<T extends LoggerFeature>(
    feature: T,
    ...args: Parameters<(typeof this)[T]>
  ) {
    const color = ColorsPerFeature[feature];
    const data = args.reduce((acc: Record<string, unknown>, arg, index) => {
      acc[`arg${index + 1}`] = arg;
      return acc;
    }, {});

    /**
     * ex:
     * [Logger] log
     *
     *   "arg1": "event name",
     *   "arg2": { ... }
     */
    const formatted =
      tryCatch(() => JSON.stringify(data, null, 2).split('\n').slice(1, -1).join('\n')).result ??
      '<unable to format data>';

    console.log(`${color}[Logger] ${feature}\n\n${formatted}\n${AnsiColors.reset}`);
  }

  protected async tryExecuteFeature<T extends LoggerFeature>(featureKey: T) {
    // errors are already reported during setup
    if (!isNil(this.error)) return;

    // acknowledge lack of provider only once
    if (isNil(this.provider) && this.acknowledged['provider']) return;

    // acknowledge lack of provider
    if (isNil(this.provider)) {
      console.warn(
        '[Logger] No provider configured. Error reporting is disabled. ' +
          'Call logger.setup() during application bootstrap.'
      );

      this.acknowledged['provider'] = true;
      return;
    }

    const provider = await this.provider;
    const isFeatureMissing = isNil(provider[featureKey]);

    // acknowledge lack of feature only once
    if (isFeatureMissing && this.acknowledged[featureKey]) return;

    // acknowledge lack of feature
    if (isFeatureMissing) {
      console.warn(
        `[Logger] The provider does not implement the ${featureKey} feature. ` +
          `Calls to logger.${featureKey}() will be ignored.`
      );

      this.acknowledged[featureKey] = true;
      return;
    }

    type FeatureType = (...args: Parameters<(typeof provider)[T]>) => void;

    return (...args: Parameters<FeatureType>): void => {
      if (provider.verbose) {
        this.logLoggerEvent(featureKey, ...args);
      }

      // avoids destructuring the feature method to preserve `this` context
      return (provider[featureKey] as FeatureType)(...args);
    };
  }

  public group<T extends Record<string, unknown>>(groupName: string, context?: T) {
    const groupId = crypto.randomUUID();

    return Object.assign(new LoggerBase(), this, {
      reportError: (error: unknown, extra = {}) =>
        this.reportError(error, {
          groupId,
          groupName,
          context,
          extra,
        }),
      log: (event: string, extra = {}) =>
        this.log(event, {
          groupId,
          groupName,
          context,
          extra,
        }),
    }) as Omit<LoggerBase, 'group' | 'setup'>;
  }

  /**
   * Reports an error event to the logger provider.
   * @param error The error to report.
   * @param extra Additional context information.
   */
  public reportError(error: unknown, extra?: Record<string, unknown>) {
    void this.tryExecuteFeature(LoggerFeature.ReportError).then((feature) =>
      feature?.(error, extra ?? {})
    );
  }

  /**
   * Logs an event to the logger provider.
   * @param event The name of the event to log.
   * @param extra Additional data associated with the event.
   */
  public log(event: string, extra?: Record<string, unknown>) {
    void this.tryExecuteFeature(LoggerFeature.Log).then((feature) => feature?.(event, extra ?? {}));
  }
}

export default new LoggerBase();
