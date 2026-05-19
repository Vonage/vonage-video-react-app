// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FontFamilySection from './FontFamilySection';
import tokenEditor$ from '../../tokenEditor$';

describe('FontFamilySection', () => {
  it('renders font family section', () => {
    const { container } = render(
      <tokenEditor$.Provider>
        <FontFamilySection />
      </tokenEditor$.Provider>
    );
    expect(container).toBeTruthy();
  });
});
