// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ClientIntegrationExample from './ClientIntegrationExample';

vi.mock('../../../../components', () => ({
  CodeDisplay: ({ code }: { code: string }) => <pre>{code}</pre>,
  Separator: () => <hr />,
}));

describe('ClientIntegrationExample', () => {
  it('renders client integration sections', () => {
    render(<ClientIntegrationExample />);

    expect(screen.getByText('Video Client SDK')).toBeTruthy();
    expect(screen.getByText('Getting started')).toBeTruthy();
  });
});
