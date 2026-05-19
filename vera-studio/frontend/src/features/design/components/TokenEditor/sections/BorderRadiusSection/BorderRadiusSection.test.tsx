// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BorderRadiusSection from './BorderRadiusSection';
import tokenEditor$ from '../../tokenEditor$';

describe('BorderRadiusSection', () => {
  it('renders border radius section', () => {
    const { container } = render(
      <tokenEditor$.Provider>
        <BorderRadiusSection />
      </tokenEditor$.Provider>
    );
    expect(container).toBeTruthy();
  });
});
