// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdvancesIntegrationExamples from './AdvancesIntegrationExamples';

vi.mock('../../stores/integrationExamples$', () => ({
  default: {
    use: {
      select: () => 'jwt',
    },
  },
}));

vi.mock('../../helpers/generateSnippets', () => ({
  generateExpressAppWithMiddlewareSnippet: () => 'middleware snippet',
  generateBuiltInMiddlewareSnippet: () => 'context snippet',
}));

vi.mock('../../../../components', () => ({
  CodeDisplay: ({ code }: { code: string }) => <pre>{code}</pre>,
  Separator: () => <hr />,
}));

describe('AdvancesIntegrationExamples', () => {
  it('renders advanced snippets', () => {
    render(<AdvancesIntegrationExamples />);

    expect(screen.getByText('middleware snippet')).toBeTruthy();
    expect(screen.getByText('context snippet')).toBeTruthy();
  });
});
