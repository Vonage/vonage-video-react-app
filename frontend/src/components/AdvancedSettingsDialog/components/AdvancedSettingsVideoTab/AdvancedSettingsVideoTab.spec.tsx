import { render as renderBase, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import type { advancedSettings } from '@Context/AdvancedSettings';
import advancedSettings$ from '@Context/AdvancedSettings';
import AdvancedSettingsVideoTab from './AdvancedSettingsVideoTab';
import { AdvancedSettingsScreenSharingTab } from '../AdvancedSettingsScreenSharingTab';

type RenderOptions = {
  dialogState?: Partial<advancedSettings>;
};

describe('AdvancedSettingsVideoTab', () => {
  afterEach(() => {
    advancedSettings$.reset();
  });

  it('renders all video sections', () => {
    render(<AdvancedSettingsVideoTab />);

    const cameraSection = screen.getByTestId('advanced-settings-video-camera-section');

    expect(cameraSection).toBeInTheDocument();
    expect(
      within(cameraSection).getByTestId('advanced-settings-video-camera-bitrate')
    ).toBeInTheDocument();
    expect(
      within(cameraSection).getByTestId('advanced-settings-video-camera-codec')
    ).toBeInTheDocument();
    expect(
      within(cameraSection).getByTestId('advanced-settings-video-camera-frame-rate')
    ).toBeInTheDocument();
    expect(
      within(cameraSection).getByTestId('advanced-settings-video-camera-resolution')
    ).toBeInTheDocument();
  });

  it('groups every existing control under the Video tab without a Camera heading', () => {
    render(<AdvancedSettingsVideoTab />);

    const cameraSection = screen.getByTestId('advanced-settings-video-camera-section');

    expect(within(cameraSection).queryByTestId('settings-section-title')).not.toBeInTheDocument();
    expect(
      within(cameraSection).getByTestId('advanced-settings-video-camera-bitrate')
    ).toBeInTheDocument();
    expect(
      within(cameraSection).getByTestId('advanced-settings-video-camera-codec')
    ).toBeInTheDocument();
    expect(
      within(cameraSection).getByTestId('advanced-settings-video-camera-frame-rate')
    ).toBeInTheDocument();
    expect(
      within(cameraSection).getByTestId('advanced-settings-video-camera-resolution')
    ).toBeInTheDocument();
    expect(
      within(cameraSection).getByTestId('advanced-settings-video-self-view-mirroring')
    ).toBeInTheDocument();
    expect(
      within(cameraSection).getByTestId('advanced-settings-video-stats-overlay')
    ).toBeInTheDocument();
  });

  it('leads the Camera section with Mirror my preview', () => {
    render(<AdvancedSettingsVideoTab />);

    const cameraSection = screen.getByTestId('advanced-settings-video-camera-section');
    const selfViewMirroring = within(cameraSection).getByTestId(
      'advanced-settings-video-self-view-mirroring'
    );
    const bitrate = within(cameraSection).getByTestId('advanced-settings-video-camera-bitrate');

    expect(
      selfViewMirroring.compareDocumentPosition(bitrate) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('toggles self-view mirroring and the stats overlay through the store', () => {
    render(<AdvancedSettingsVideoTab />);

    expect(advancedSettings$.getState().selfViewMirroringEnabled).toBe(true);
    screen.getByTestId('advanced-settings-video-self-view-mirroring').click();
    expect(advancedSettings$.getState().selfViewMirroringEnabled).toBe(false);

    const statsOverlayBefore = advancedSettings$.getState().videoStatsOverlayEnabled;
    screen.getByTestId('advanced-settings-video-stats-overlay').click();
    expect(advancedSettings$.getState().videoStatsOverlayEnabled).toBe(!statsOverlayBefore);
  });

  it('renders the Screen Sharing section with its own Optimize for control', () => {
    render(<AdvancedSettingsScreenSharingTab />);

    const screenSharingSection = screen.getByTestId('advanced-settings-screen-sharing-tab');

    expect(screenSharingSection).toBeInTheDocument();
    const screenShareContentHint = within(screenSharingSection).getByTestId(
      'advanced-settings-video-screen-share-content-hint'
    );
    expect(screenShareContentHint).toHaveValue('detail');
    expect(
      [...(screenShareContentHint as HTMLSelectElement).options].map((option) => option.value)
    ).toEqual(['', 'motion', 'detail', 'text']);
  });

  it('defaults the screen share to following the camera codec, and reveals its own list on manual', () => {
    render(<AdvancedSettingsScreenSharingTab />);

    const screenSharingSection = screen.getByTestId('advanced-settings-screen-sharing-tab');
    const screenShareCodec = within(screenSharingSection).getByTestId(
      'advanced-settings-video-screen-share-codec'
    );

    expect(screenShareCodec).toHaveValue('inherit');
    expect([...(screenShareCodec as HTMLSelectElement).options].map((o) => o.value)).toEqual([
      'inherit',
      'automatic',
      'manual',
    ]);
    expect(
      screen.queryByTestId('advanced-settings-screen-share-codec-priority-list')
    ).not.toBeInTheDocument();

    render(<AdvancedSettingsScreenSharingTab />, {
      dialogState: { screenShareCodecMode: 'manual' },
    });

    expect(
      screen.getAllByTestId('advanced-settings-screen-share-codec-priority-list').length
    ).toBeGreaterThan(0);
  });

  it('defaults every screen-share constraint to the browser default, so shares stay unconstrained', () => {
    render(<AdvancedSettingsScreenSharingTab />);

    const screenSharingSection = screen.getByTestId('advanced-settings-screen-sharing-tab');

    expect(
      within(screenSharingSection).getByTestId('advanced-settings-video-screen-share-frame-rate')
    ).toHaveValue('default-sdk');
    expect(
      within(screenSharingSection).getByTestId('advanced-settings-video-screen-share-resolution')
    ).toHaveValue('default-sdk');
    expect(
      within(screenSharingSection).getByTestId('advanced-settings-video-screen-share-bitrate')
    ).toHaveValue('default-sdk');
    expect(
      screen.queryByTestId('advanced-settings-screen-share-custom-video-bitrate-slider')
    ).not.toBeInTheDocument();
  });

  it('shows a separate custom bitrate slider for the screen share', () => {
    render(<AdvancedSettingsScreenSharingTab />, {
      dialogState: { screenShareBitrateMode: 'custom', screenShareCustomVideoBitrate: 750_000 },
    });

    const slider = screen.getByTestId('advanced-settings-screen-share-custom-video-bitrate-slider');

    expect(slider).toHaveValue('750000');
    expect(
      screen.queryByTestId('advanced-settings-custom-video-bitrate-slider')
    ).not.toBeInTheDocument();
  });

  it('offers the camera its own Optimize for control, without the screen-only text option', () => {
    render(<AdvancedSettingsVideoTab />);

    const cameraSection = screen.getByTestId('advanced-settings-video-camera-section');
    const cameraContentHint = within(cameraSection).getByTestId(
      'advanced-settings-video-camera-content-hint'
    );

    expect(cameraContentHint).toHaveValue('');
    expect(
      [...(cameraContentHint as HTMLSelectElement).options].map((option) => option.value)
    ).toEqual(['', 'motion', 'detail']);
  });

  it('renders codec priority drag and drop when codec mode is manual', () => {
    render(<AdvancedSettingsVideoTab />, {
      dialogState: { codecMode: 'manual', codecPriority: ['vp9', 'vp8', 'h264'] },
    });

    expect(screen.getByTestId('advanced-settings-codec-priority-item-vp9')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-vp8')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-h264')).toBeInTheDocument();
  });

  it('renders custom video bitrate controls when bitrate mode is custom', () => {
    render(<AdvancedSettingsVideoTab />, { dialogState: { bitrateMode: 'custom' } });

    expect(screen.getByTestId('advanced-settings-custom-video-bitrate-slider')).toBeInTheDocument();
  });
});

function render(ui: ReactElement, { dialogState }: RenderOptions = {}) {
  if (dialogState) {
    advancedSettings$.setState((state) => ({ ...state, ...dialogState }));
  }

  return renderBase(ui);
}
