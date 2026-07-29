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

    expect(screen.getByRole('heading', { name: /video/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^bitrate$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^codec$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^frame rate$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^resolution$/i)).toBeInTheDocument();
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

  it('renders the Screen Sharing section with its description and no controls yet', () => {
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
    expect(within(screenSharingSection).queryAllByRole('combobox')).toHaveLength(0);
  });

  it('renders codec priority drag and drop when codec mode is manual', () => {
    render(<AdvancedSettingsVideoTab />, {
      dialogState: { codecMode: 'manual', codecPriority: ['vp9', 'vp8', 'h264'] },
    });

    expect(screen.getByText(/codec priority/i)).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-vp9')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-vp8')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-h264')).toBeInTheDocument();
  });

  it('renders custom video bitrate controls when bitrate mode is custom', () => {
    render(<AdvancedSettingsVideoTab />, { dialogState: { bitrateMode: 'custom' } });

    expect(screen.getByText(/custom bitrate/i)).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-custom-video-bitrate-slider')).toBeInTheDocument();
    expect(screen.getAllByText(/5 kbps/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/^10 Mbps$/i)).toBeInTheDocument();
  });
});

function render(ui: ReactElement, { dialogState }: RenderOptions = {}) {
  if (dialogState) {
    advancedSettings$.setState((state) => ({ ...state, ...dialogState }));
  }

  return renderBase(ui);
}
