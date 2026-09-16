import { renderHook as renderHookBase } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StrictMode } from 'react';
import { MemoryRouterProps } from 'react-router-dom';
import useGoodByePage from '.';
import composeProviders from '@web/helpers/composeProviders';
import { makeMemoryRouterWrapper } from '@web-test/providers';

describe('useGoodByePage', () => {
  it('uses header and caption from location state', () => {
    const { result } = renderHook(() => useGoodByePage(), {
      routerProps: {
        initialEntries: [
          {
            pathname: '/goodbye',
            state: {
              header: 'Custom Header',
              caption: 'Custom Caption',
            },
          },
        ],
      },
    });

    expect(result.current.header).toBe('Custom Header');
    expect(result.current.caption).toBe('Custom Caption');
    expect(result.current.isSelfDeclinedRecording).toBe(false);
  });

  it('uses isSelfDeclinedRecording from location state', () => {
    const { result } = renderHook(() => useGoodByePage(), {
      routerProps: {
        initialEntries: [
          {
            pathname: '/goodbye',
            state: {
              isSelfDeclinedRecording: true,
            },
          },
        ],
      },
    });

    expect(result.current.header).toBe('You have left the meeting');
    expect(result.current.caption).toBe('Thank you for joining!');
    expect(result.current.isSelfDeclinedRecording).toBe(true);
  });
});

type RenderOptions = {
  routerProps?: MemoryRouterProps;
};

function renderHook<Result>(render: () => Result, { routerProps }: RenderOptions = {}) {
  const { wrapper: MemoryRouterWrapper } = makeMemoryRouterWrapper(routerProps);

  const wrapper = composeProviders(StrictMode, MemoryRouterWrapper);

  return renderHookBase(render, { wrapper });
}
