import ApplicationClientError from '../../ApplicationClientError/ApplicationClientError';
import { isNil, isString } from '@common/assertions';
import { t } from 'i18next';

export type ApplicationErrorMapperConfig = {
  fallbackMessage: string;
  type: string;
};

function makeApplicationErrorMapper(): ApplicationErrorMapper;

function makeApplicationErrorMapper(fallbackMessage: string): ApplicationErrorMapper;

function makeApplicationErrorMapper(config: ApplicationErrorMapperConfig): ApplicationErrorMapper;

function makeApplicationErrorMapper(
  arg?: string | ApplicationErrorMapperConfig
): ApplicationErrorMapper {
  const config =
    isString(arg) || isNil(arg)
      ? {
          fallbackMessage: arg ?? t('errors.unknown'),
          type: 'error',
        }
      : arg;

  return (source: unknown): ApplicationClientError => {
    const { fallbackMessage, type } = config;

    return new ApplicationClientError({
      src: source,
      fallbackConfig: {
        fallbackMessage,
        type,
      },
    });
  };
}

type ApplicationErrorMapper = (source: unknown) => ApplicationClientError;

export default makeApplicationErrorMapper;
