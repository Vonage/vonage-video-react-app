import { renderHook as renderHookBase, act } from '@testing-library/react';
import composeProviders from '../srcBrowser/helpers/composeProviders';

type HookResult<Result, Props> = ReturnType<typeof renderHookBase<Result, Props>>;

/**
 * Render an asynchronous hook,
 * Async hooks are the ones that require SuspenseBoundary to be rendered.
 */
async function renderAsyncHook<Result, Props>(
  render: (initialProps: Props) => Result,
  options?: Parameters<typeof renderHookBase<Result, Props>>[1]
): Promise<HookResult<Result, Props>> {
  let result: HookResult<Result, Props>;

  await act(async () => {
    result = renderHookBase(render, {
      ...options,
      wrapper: composeProviders(...(options?.wrapper ? [options.wrapper] : [])),
    });

    await Promise.resolve();
  });

  return result!;
}

export default renderAsyncHook;
