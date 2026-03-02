import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render as renderBase, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { makeTestProvider } from '@test/providers';
import ScreenSharingButton, { ScreenShareButtonProps } from './ScreenSharingButton';
import { env } from '../../env';

describe('ScreenSharingButton', () => {
  const mockToggleScreenShare = vi.fn();
  const mockChangeContentHint = vi.fn();

  const defaultProps: ScreenShareButtonProps = {
    toggleScreenShare: mockToggleScreenShare,
    isSharingScreen: false,
    isViewingScreenShare: false,
    changeContentHint: mockChangeContentHint,
    currentContentHint: '',
  };

  it('renders the share screen button', () => {
    render(<ScreenSharingButton {...defaultProps} />);
    expect(screen.getByTestId('ScreenShareIcon')).toBeInTheDocument();
  });

  it('opens the ContentHintMenu when the share button is clicked (not yet sharing)', () => {
    render(<ScreenSharingButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('screensharing-button'));
    expect(screen.getByTestId('content-hint-primary-button')).toBeInTheDocument();
  });

  it('calls toggleScreenShare with the selected hint when Share is confirmed in ContentHintMenu', () => {
    render(<ScreenSharingButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('screensharing-button'));
    fireEvent.click(screen.getByTestId('content-hint-primary-button'));
    expect(mockToggleScreenShare).toHaveBeenCalledWith('detail');
  });

  it('calls toggleScreenShare directly when the button is clicked while already sharing', () => {
    render(<ScreenSharingButton {...defaultProps} isSharingScreen />);
    fireEvent.click(screen.getByTestId('screensharing-button'));
    expect(mockToggleScreenShare).toHaveBeenCalled();
  });

  it('renders the pop up dialog to confirm that user wants to kick off another screenshare', () => {
    render(<ScreenSharingButton {...defaultProps} isViewingScreenShare />);
    fireEvent.click(screen.getByTestId('screensharing-button'));
    fireEvent.click(screen.getByTestId('content-hint-primary-button'));
    expect(
      screen.getByText(
        'Looks like there is someone else sharing their screen. If you continue, their screen is no longer going to be shared.'
      )
    ).toBeInTheDocument();
  });

  it('is not rendered when allowScreenShare is false', () => {
    env.partialUpdate({
      ALLOW_SCREEN_SHARE: false,
    });

    render(<ScreenSharingButton {...defaultProps} />);

    expect(screen.queryByTestId('ScreenShareIcon')).not.toBeInTheDocument();
  });

  it('calls toggleScreenShare immediately when clicked and allowContentHints is false', () => {
    render(<ScreenSharingButton {...defaultProps} />, {
      appConfigContext: {
        value: {
          meetingRoomSettings: {
            allowContentHints: false,
          },
        },
      },
    });
    fireEvent.click(screen.getByTestId('screensharing-button'));
    expect(mockToggleScreenShare).toHaveBeenCalledWith();
    expect(screen.queryByTestId('content-hint-primary-button')).not.toBeInTheDocument();
  });

  it('does not open ContentHintMenu when clicked and allowContentHints is false', () => {
    render(<ScreenSharingButton {...defaultProps} />, {
      appConfigContext: {
        value: {
          meetingRoomSettings: {
            allowContentHints: false,
          },
        },
      },
    });
    fireEvent.click(screen.getByTestId('screensharing-button'));
    expect(screen.queryByTestId('content-hint-menu')).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([]);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
