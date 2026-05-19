// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ButtonsTab from './ButtonsTab';

describe('ButtonsTab', () => {
  it('renders buttons tab', () => {
    const { container } = render(<ButtonsTab />);
    expect(container.querySelector('button')).toBeTruthy();
  });
});
