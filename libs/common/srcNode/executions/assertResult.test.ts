import { describe, it, expect } from 'vitest';
import StatusCodeEnum from 'status-code-enum';
import assertResult from './assertResult';
import {
  tryCatch,
  wait,
  isApplicationServerError,
  makeBadRequestErrorHandler,
  makeInternalErrorHandler,
} from '../';

describe('assertResult (server)', () => {
  it('should return the result when callback succeeds', async () => {
    expect.assertions(2);

    const syncResult = assertResult(() => 'success', {
      fallbackConfig: {
        fallbackMessage: 'Should not fail',
        statusCode: StatusCodeEnum.ServerErrorInternal,
      },
    });

    const asyncResult = await assertResult(() => Promise.resolve('async success'), {
      fallbackConfig: {
        fallbackMessage: 'Should not fail',
        statusCode: StatusCodeEnum.ServerErrorInternal,
      },
    });

    expect(syncResult).toBe('success');
    expect(asyncResult).toBe('async success');
  });

  it('should throw an ApplicationError when callback throws', async () => {
    expect.assertions(6);

    const { error: syncError } = tryCatch(() =>
      assertResult((): void => {
        throw new Error('Sync error');
      }, makeInternalErrorHandler('Something went wrong 1'))
    );

    const { error: asyncError } = await tryCatch(async () =>
      assertResult(async (): Promise<void> => {
        await wait(1);
        throw new Error('Async error');
      }, makeBadRequestErrorHandler('Something went wrong 2'))
    );

    const syncSafeExport = makeInternalErrorHandler('error')(syncError).exportSafely();
    const asyncSafeExport = makeInternalErrorHandler('error')(asyncError).exportSafely();

    expect(isApplicationServerError(syncError)).toBe(true);
    expect(syncSafeExport.statusCode).toBe(StatusCodeEnum.ServerErrorInternal);
    expect(syncSafeExport.message).toBe('Something went wrong 1');

    expect(isApplicationServerError(asyncError)).toBe(true);
    expect(asyncSafeExport.statusCode).toBe(StatusCodeEnum.ClientErrorBadRequest);
    expect(asyncSafeExport.message).toBe('Something went wrong 2');
  });
});
