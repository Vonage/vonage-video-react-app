// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ColorsSection from './ColorsSection';
import tokenEditor$ from '../../tokenEditor$';

describe('ColorsSection', () => {
  it('renders colors section', () => {
    const { container } = render(
      <tokenEditor$.Provider>
        <ColorsSection />
      </tokenEditor$.Provider>
    );
    expect(container).toBeTruthy();
  });
});
