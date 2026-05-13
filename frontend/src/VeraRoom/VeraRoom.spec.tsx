import '@web-test/environment/helpers/setupMuiMaterialStylesMock';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import bridge$ from './stores/bridge';
import { runtime$ } from '@core/stores';
import VeraRoom from './VeraRoom';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

const renderWithBridge = (ui: React.ReactElement) =>
  render(
    <bridge$.Provider>
      <runtime$.Provider videoClient="some-url">{ui}</runtime$.Provider>
    </bridge$.Provider>
  );

beforeEach(() => {
  setupWindowNavigatorMock({
    permissions: {
      query: Promise.resolve({
        state: 'granted',
        addEventListener: () => {},
      } as unknown as PermissionStatus),
    },
  });
});

describe('VeraRoom', () => {
  it('renders correctly', () => {
    renderWithBridge(<VeraRoom data-testid="vera-room" />);

    const veraRoom = screen.getByTestId('vera-room');
    expect(veraRoom).toBeInTheDocument();
    expect(veraRoom).toHaveClass('VeraRoom');
  });

  it('applies custom className', () => {
    // eslint-disable-next-line tailwindcss/no-custom-classname
    renderWithBridge(<VeraRoom data-testid="vera-room" className="custom-class" />);

    const veraRoom = screen.getByTestId('vera-room');
    expect(veraRoom).toHaveClass('VeraRoom');
    expect(veraRoom).toHaveClass('custom-class');
  });

  it('passes additional props to the container', () => {
    renderWithBridge(<VeraRoom data-testid="vera-room" id="test-id" />);

    const veraRoom = screen.getByTestId('vera-room');
    expect(veraRoom).toHaveAttribute('id', 'test-id');
  });
});
