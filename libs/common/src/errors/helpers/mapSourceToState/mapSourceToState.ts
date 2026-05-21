import isString from '../../../assertions/isString';
import removeUndefinedProps from '../../../helpers/removeUndefinedProps';
import isApplicationError from '../../assertions/isApplicationError';
import isApplicationErrorLike from '../../assertions/isApplicationErrorLike';

export type ApplicationErrorState = import('../../types').ApplicationErrorState;

export const mapSourceToState = (src: unknown): Partial<ApplicationErrorState> => {
  const props = (() => {
    if (isString(src)) {
      return {
        message: src,
      };
    }

    if (isApplicationError(src) || isApplicationErrorLike(src)) {
      const copy: Partial<ApplicationErrorState> = {
        message: src.message,
      };

      // avoid adding non present properties
      if (Object.hasOwn(src, 'fallbackConfig')) copy.fallbackConfig = src.fallbackConfig;
      if (Object.hasOwn(src, 'severity')) copy.severity = src.severity;
      if (Object.hasOwn(src, 'stack')) copy.stack = src.stack;
      if (Object.hasOwn(src, 'issues')) copy.issues = src.issues;
      if (Object.hasOwn(src, 'statusCode')) copy.statusCode = src.statusCode;
      if (Object.hasOwn(src, 'type')) copy.type = src.type;
      if (Object.hasOwn(src, 'name')) copy.name = src.name;

      return copy;
    }

    return {};
  })();

  return removeUndefinedProps<Partial<ApplicationErrorState>>(props);
};

export default mapSourceToState;
