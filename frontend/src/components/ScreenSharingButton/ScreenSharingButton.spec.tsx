import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render as renderBase, RenderOptions, screen } from '@testing-library/react';
import AppConfigStore from '@Context/ConfigProvider/AppConfigStore';
import { ConfigProviderBase } from '@Context/ConfigProvider/ConfigProvider';
import { ReactElement, FC, PropsWithChildren } from 'react';
import ScreenSharingButton, { ScreenShareButtonProps } from './ScreenSharingButton';

describe('ScreenSharingButton', () => {
  const mockToggleScreenShare = vi.fn();

  const defaultProps: ScreenShareButtonProps = {
    toggleScreenShare: mockToggleScreenShare,
    isSharingScreen: false,
    isViewingScreenShare: false,
  };

  it('renders the share screen button', () => {
    render(<ScreenSharingButton {...defaultProps} />);
    expect(screen.getByTestId('ScreenShareIcon')).toBeInTheDocument();

    const button = screen.getByRole('button');
    button.click();
    expect(mockToggleScreenShare).toHaveBeenCalled();
  });

  it('renders the share screen off button', () => {
    render(<ScreenSharingButton {...defaultProps} isSharingScreen />);
    expect(screen.getByTestId('StopScreenShareIcon')).toBeInTheDocument();

    const button = screen.getByRole('button');
    button.click();
    expect(mockToggleScreenShare).toHaveBeenCalled();
  });

  it('renders the pop up dialog to confirm that user wants to kick off another screenshare', () => {
    render(<ScreenSharingButton {...defaultProps} isViewingScreenShare />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(
      screen.getByText(
        'Looks like there is someone else sharing their screen. If you continue, their screen is no longer going to be shared.'
      )
    ).toBeInTheDocument();
  });

  it('is not rendered when allowScreenShare is false', () => {
    const configStore = new AppConfigStore({
      meetingRoomSettings: {
        allowScreenShare: false,
      },
    });
    render(<ScreenSharingButton {...defaultProps} />, {
      wrapper: makeProvidersWrapper({ configStore }),
    });
    expect(screen.queryByTestId('ScreenShareIcon')).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement, options?: RenderOptions) {
  const Wrapper = options?.wrapper ?? makeProvidersWrapper();
  return renderBase(ui, { ...options, wrapper: Wrapper });
}

function makeProvidersWrapper(providers?: { configStore?: AppConfigStore }) {
  const configStore =
    providers?.configStore ??
    new AppConfigStore({
      meetingRoomSettings: {
        allowScreenShare: true,
      },
    });

  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <ConfigProviderBase value={configStore}>{children}</ConfigProviderBase>
  );

  return Wrapper;
}
