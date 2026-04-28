// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ExpressIntegrationExamples from './ExpressIntegrationExamples';

vi.mock('../../stores/integrationExamples$', () => ({
  default: {
    use: {
      select: () => 'signature',
    },
  },
}));

vi.mock('../../helpers/generateSnippets', () => ({
  generateExpressAppSnippet: () => 'express snippet',
}));

vi.mock('../../../../components', () => ({
  CodeDisplay: ({ code }: { code: string }) => <pre>{code}</pre>,
  Separator: () => <hr />,
}));

describe('ExpressIntegrationExamples', () => {
  it('renders generated express snippet', () => {
    render(<ExpressIntegrationExamples />);

    expect(screen.getByText('express snippet')).toBeTruthy();
  });
});
