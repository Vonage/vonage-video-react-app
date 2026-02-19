import { describe, it, expect } from 'vitest';
import { render, renderHook } from '@testing-library/react';
import React, { FC } from 'react';
import SuspenseBoundary, { suspenseContext, suspenseToken } from './';
import { makeGenericProviderWrapper } from '../../../testBrowser';
import defer from '@common/execution/defer';
import use$ from '@web/hooks/use$';

describe('SuspenseBoundary', () => {
  it('should render children without errors', () => {
    const { container } = render(
      <SuspenseBoundary fallback={<div>Loading</div>}>
        <div>Content</div>
      </SuspenseBoundary>
    );

    expect(container.textContent).toContain('Content');
  });

  it('should provide suspense token in context', () => {
    const [wrapper] = makeGenericProviderWrapper(SuspenseBoundary, suspenseContext);

    const { result } = renderHook(
      () => {
        return React.useContext(suspenseContext);
      },
      { wrapper }
    );

    expect(result.current).toBe(suspenseToken);
  });

  it('should render fallback when component suspends', () => {
    const deferred = defer<void>();

    const SuspendingComponent: FC = () => {
      use$(deferred.promise);
      return <div>Should not render</div>;
    };

    const { container } = render(
      <SuspenseBoundary fallback={<div>Loading</div>}>
        <SuspendingComponent />
      </SuspenseBoundary>
    );

    expect(container.textContent).toContain('Loading');
    expect(container.textContent).not.toContain('Should not render');
  });
});
