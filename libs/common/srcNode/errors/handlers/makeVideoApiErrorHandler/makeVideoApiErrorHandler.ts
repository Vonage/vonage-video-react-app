import { isErrorLike, isNil, isString } from '@common/assertions';
import buildThirdPartyErrorHandler, {
  BuildThirdPartyErrorHandler,
  BuildThirdPartyErrorHandlerArgs,
} from '../makeThirdPartyErrorHandler';

/**
 * The Opentok SDK returns exceptions in a non friendly format, ex:
 *
 *  ```ts
 *  {
 *    message: 'Unexpected response from OpenTok: "{"message":"The url structure must be valid."}"'
 *  }
 *  ```
 *
 *  The error is a message string that contains a prefix and then an embedded JSON object with more details.
 *  This handler check if the error message follows this format, and if so, it extracts the JSON object and uses its message property
 *
 *  So the above error would be transformed to:
 *
 *  ```ts
 *  {
 *    message: 'Unexpected response from OpenTok',
 *    issues: ["The url structure must be valid."]
 *  }
 * ```
 */
export function buildVideoApiErrorHandler(): BuildThirdPartyErrorHandler;

export function buildVideoApiErrorHandler(fallbackMessage: string): BuildThirdPartyErrorHandler;

export function buildVideoApiErrorHandler({
  fallbackMessage,
  mapThirdPartyErrors,
}: BuildThirdPartyErrorHandlerArgs): BuildThirdPartyErrorHandler;

export function buildVideoApiErrorHandler(arg?: string | BuildThirdPartyErrorHandlerArgs) {
  const opentokDefaultMessage = 'Unexpected response from OpenTok';
  const prefix = `${opentokDefaultMessage}:`;

  const options: Partial<BuildThirdPartyErrorHandlerArgs> = (() => {
    if (isNil(arg) || isString(arg)) {
      return {
        fallbackMessage: arg ?? opentokDefaultMessage,
        mapThirdPartyErrors: true,
      };
    }

    return arg;
  })();

  return (err: unknown) => {
    const src = (() => {
      try {
        const isOpentokError = isErrorLike(err) && err.message.startsWith(prefix);

        if (!isOpentokError) return err;

        const jsonString = err.message.split(prefix)[1];
        const json = JSON.parse(jsonString.trim().slice(1, -1));
        const parsedMessage = json.message
          ? {
              message: prefix.trim().slice(0, -1),
              issues: [json.message],
            }
          : err;

        return {
          fallbackMessage: opentokDefaultMessage,
          ...parsedMessage,
        };
      } catch {
        return {
          src: err,
        };
      }
    })();

    return buildThirdPartyErrorHandler({
      fallbackMessage: options.fallbackMessage ?? opentokDefaultMessage,
      mapThirdPartyErrors: options.mapThirdPartyErrors ?? false,
    })(src);
  };
}

export default buildVideoApiErrorHandler;
