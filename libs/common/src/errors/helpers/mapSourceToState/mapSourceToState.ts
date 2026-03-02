import isString from '../../../assertions/isString';
import removeUndefinedProps from '../../../helpers/removeUndefinedProps';
import isApplicationError from '../../assertions/isApplicationError';
import isApplicationErrorLike from '../../assertions/isApplicationErrorLike';

export type ApplicationErrorState = import('../../types').ApplicationErrorState;

export const mapSourceToState = (src: unknown): Partial<ApplicationErrorState> => {
  return removeUndefinedProps<Partial<ApplicationErrorState>>(
    (() => {
      if (isString(src)) {
        return {
          message: src,
        };
      }

      if (isApplicationError(src) || isApplicationErrorLike(src)) {
        const copy: Partial<ApplicationErrorState> = {
          message: src.message,
          fallbackConfig: src.fallbackConfig,
          severity: src.severity,
          stack: src.stack,
          values: src.values,
          statusCode: src.statusCode,
        };

        return copy;
      }

      return {};
    })()
  );
};

export default mapSourceToState;
