import { StatusCode } from 'status-code-enum';
import type { ApplicationErrorFallbackConfig } from '@common/errors/types';

type ClientErrorFallbackConfig = Omit<ApplicationErrorFallbackConfig, 'statusCode'> & {
  statusCode?: StatusCode;
};

export default ClientErrorFallbackConfig;
