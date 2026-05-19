// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CustomizeRoomPage from './CustomizeRoomPage';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

describe('CustomizeRoomPage', () => {
  it('renders customize room page', () => {
    const { container } = render(
      <BrowserRouter>
        <CustomizeRoomPage />
      </BrowserRouter>
    );
    expect(container).toBeTruthy();
  });
});
