import type * as ReactDOMClient from 'react-dom/client';
import {
  render as renderBase,
  act,
  type Queries,
  type queries,
  type RenderOptions,
} from '@testing-library/react';
import { composeProviders } from '../srcBrowser/helpers';

type RendererableContainer = ReactDOMClient.Container;
type HydrateableContainer = Parameters<(typeof ReactDOMClient)['hydrateRoot']>[0];

type HookResult<
  Q extends Queries = typeof queries,
  Container extends RendererableContainer | HydrateableContainer = HTMLElement,
  BaseElement extends RendererableContainer | HydrateableContainer = Container,
> = ReturnType<typeof renderBase<Q, Container, BaseElement>>;

/**
 * Render an asynchronous component,
 * Async components are the ones that require SuspenseBoundary to be rendered.
 */
async function renderAsyncComponent<
  Q extends Queries = typeof queries,
  Container extends RendererableContainer | HydrateableContainer = HTMLElement,
  BaseElement extends RendererableContainer | HydrateableContainer = Container,
>(
  ui: React.ReactNode,
  options: RenderOptions<Q, Container, BaseElement>
): Promise<HookResult<Q, Container, BaseElement>> {
  let result: HookResult<Q, Container, BaseElement>;

  await act(async () => {
    result = renderBase(ui, {
      ...options,
      wrapper: composeProviders(...(options?.wrapper ? [options.wrapper] : [])),
    });

    await Promise.resolve();
  });

  return result!;
}

export default renderAsyncComponent;
