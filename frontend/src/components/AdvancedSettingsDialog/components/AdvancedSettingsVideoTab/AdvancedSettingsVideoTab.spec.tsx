import { render as renderBase, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import type { advancedSettings } from '@Context/AdvancedSettings';
import advancedSettings$ from '@Context/AdvancedSettings';
import AdvancedSettingsVideoTab from './AdvancedSettingsVideoTab';

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

    expect(screen.getByRole('heading', { name: /video/i })).toBeInTheDocument();
    expect(within(cameraSection).getByLabelText(/^bitrate$/i)).toBeInTheDocument();
    expect(within(cameraSection).getByLabelText(/^codec$/i)).toBeInTheDocument();
    expect(within(cameraSection).getByLabelText(/^frame rate$/i)).toBeInTheDocument();
    expect(within(cameraSection).getByLabelText(/^resolution$/i)).toBeInTheDocument();
  });

  it('groups every existing control under the Camera section', () => {
    render(<AdvancedSettingsVideoTab />);

    const cameraSection = screen.getByTestId('advanced-settings-video-camera-section');

    expect(within(cameraSection).getByRole('heading', { name: 'Camera' })).toBeInTheDocument();
    expect(within(cameraSection).getByLabelText(/^bitrate$/i)).toBeInTheDocument();
    expect(within(cameraSection).getByLabelText(/^codec$/i)).toBeInTheDocument();
    expect(within(cameraSection).getByLabelText(/^frame rate$/i)).toBeInTheDocument();
    expect(within(cameraSection).getByLabelText(/^resolution$/i)).toBeInTheDocument();
    expect(within(cameraSection).getByLabelText('Mirror my video')).toBeInTheDocument();
    expect(
      within(cameraSection).getByLabelText('Show resolution and frame rate')
    ).toBeInTheDocument();
  });

  it('leads the Camera section with Mirror my video', () => {
    render(<AdvancedSettingsVideoTab />);

    const cameraSection = screen.getByTestId('advanced-settings-video-camera-section');
    const [firstLabelledControl] = within(cameraSection).getAllByLabelText(/.+/);

    expect(firstLabelledControl).toBe(within(cameraSection).getByLabelText('Mirror my video'));
  });

  it('toggles self-view mirroring and the stats overlay through the store', () => {
    render(<AdvancedSettingsVideoTab />);

    expect(advancedSettings$.getState().selfViewMirroringEnabled).toBe(true);
    screen.getByLabelText('Mirror my video').click();
    expect(advancedSettings$.getState().selfViewMirroringEnabled).toBe(false);

    const statsOverlayBefore = advancedSettings$.getState().videoStatsOverlayEnabled;
    screen.getByLabelText('Show resolution and frame rate').click();
    expect(advancedSettings$.getState().videoStatsOverlayEnabled).toBe(!statsOverlayBefore);
  });

  it('renders the Screen Sharing section with its own Optimize for control', () => {
    render(<AdvancedSettingsVideoTab />);

    const screenSharingSection = screen.getByTestId(
      'advanced-settings-video-screen-sharing-section'
    );

    expect(
      within(screenSharingSection).getByRole('heading', { name: 'Screen Sharing' })
    ).toBeInTheDocument();
    expect(
      within(screenSharingSection).getByText(/take effect the next time/i)
    ).toBeInTheDocument();

    const screenShareContentHint = within(screenSharingSection).getByLabelText('Optimize for');
    expect(screenShareContentHint).toHaveValue('detail');
    expect(
      [...(screenShareContentHint as HTMLSelectElement).options].map((option) => option.value)
    ).toEqual(['', 'motion', 'detail', 'text']);
  });

  it('defaults the screen share to following the camera codec, and reveals its own list on manual', () => {
    render(<AdvancedSettingsVideoTab />);

    const screenSharingSection = screen.getByTestId(
      'advanced-settings-video-screen-sharing-section'
    );
    const screenShareCodec = within(screenSharingSection).getByLabelText(/^codec$/i);

    expect(screenShareCodec).toHaveValue('inherit');
    expect([...(screenShareCodec as HTMLSelectElement).options].map((o) => o.value)).toEqual([
      'inherit',
      'automatic',
      'manual',
    ]);
    expect(
      screen.queryByTestId('advanced-settings-screen-share-codec-priority-list')
    ).not.toBeInTheDocument();

    render(<AdvancedSettingsVideoTab />, {
      dialogState: { screenShareCodecMode: 'manual' },
    });

    expect(
      screen.getAllByTestId('advanced-settings-screen-share-codec-priority-list').length
    ).toBeGreaterThan(0);
  });

  it('defaults every screen-share constraint to the browser default, so shares stay unconstrained', () => {
    render(<AdvancedSettingsVideoTab />);

    const screenSharingSection = screen.getByTestId(
      'advanced-settings-video-screen-sharing-section'
    );

    expect(within(screenSharingSection).getByLabelText(/^frame rate$/i)).toHaveValue('default-sdk');
    expect(within(screenSharingSection).getByLabelText(/^resolution$/i)).toHaveValue('default-sdk');
    expect(within(screenSharingSection).getByLabelText(/^bitrate$/i)).toHaveValue('default-sdk');
    expect(
      screen.queryByTestId('advanced-settings-screen-share-custom-video-bitrate-slider')
    ).not.toBeInTheDocument();
  });

  it('shows a separate custom bitrate slider for the screen share', () => {
    render(<AdvancedSettingsVideoTab />, {
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
    const cameraContentHint = within(cameraSection).getByLabelText('Optimize for');

    expect(cameraContentHint).toHaveValue('');
    expect(
      [...(cameraContentHint as HTMLSelectElement).options].map((option) => option.value)
    ).toEqual(['', 'motion', 'detail']);
  });

  it('renders codec priority drag and drop when codec mode is manual', () => {
    render(<AdvancedSettingsVideoTab />, {
      dialogState: { codecMode: 'manual', codecPriority: ['vp9', 'vp8', 'h264'] },
    });

    const cameraSection = screen.getByTestId('advanced-settings-video-camera-section');

    expect(within(cameraSection).getByText(/codec priority/i)).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-vp9')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-vp8')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-h264')).toBeInTheDocument();
  });

  it('renders custom video bitrate controls when bitrate mode is custom', () => {
    render(<AdvancedSettingsVideoTab />, { dialogState: { bitrateMode: 'custom' } });

    const cameraSection = screen.getByTestId('advanced-settings-video-camera-section');

    expect(within(cameraSection).getByText(/custom bitrate/i)).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-custom-video-bitrate-slider')).toBeInTheDocument();
    expect(within(cameraSection).getAllByText(/5 kbps/i).length).toBeGreaterThan(0);
    expect(within(cameraSection).getByText(/^10 Mbps$/i)).toBeInTheDocument();
  });
});

function render(ui: ReactElement, { dialogState }: RenderOptions = {}) {
  if (dialogState) {
    advancedSettings$.setState((state) => ({ ...state, ...dialogState }));
  }

  return renderBase(ui);
}
