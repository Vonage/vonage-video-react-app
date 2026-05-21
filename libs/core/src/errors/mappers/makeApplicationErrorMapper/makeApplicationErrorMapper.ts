import ApplicationClientError from '../../ApplicationClientError/ApplicationClientError';
import { isErrorLike, isString } from '@common/assertions';

export type ApplicationErrorMapperConfig = {
  fallbackMessage: string;
  type: string;
};

function makeApplicationErrorMapper(fallbackMessage: string): ApplicationErrorMapper;

function makeApplicationErrorMapper(config: ApplicationErrorMapperConfig): ApplicationErrorMapper;

function makeApplicationErrorMapper(
  arg: string | ApplicationErrorMapperConfig
): ApplicationErrorMapper {
  const config = isString(arg)
    ? {
        fallbackMessage: arg ?? 'An unexpected error occurred',
        type: 'error',
      }
    : arg;

  return (source: unknown): ApplicationClientError => {
    const { fallbackMessage, type } = config;

    return new ApplicationClientError({
      src: source,
      fallbackConfig: {
        // errors on the client always are considered safe to expose
        issues: isErrorLike(source) ? [source.message] : undefined,
        fallbackMessage,
        type,
      },
    });
  };
}

type ApplicationErrorMapper = (source: unknown) => ApplicationClientError;

export default makeApplicationErrorMapper;
