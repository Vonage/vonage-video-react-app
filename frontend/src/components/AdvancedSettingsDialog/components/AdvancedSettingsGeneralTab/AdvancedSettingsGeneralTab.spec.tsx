import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import advancedSettings$ from '@Context/AdvancedSettings';
import { env } from '../../../../env';
import AdvancedSettingsGeneralTab from './AdvancedSettingsGeneralTab';

describe('AdvancedSettingsGeneralTab', () => {
  afterEach(() => {
    advancedSettings$.reset();
  });

  it('renders the general tab content', () => {
    render(<AdvancedSettingsGeneralTab />);

    expect(screen.getByRole('heading', { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset default values/i })).toBeInTheDocument();
    expect(screen.getByText(/restore all settings to their default values/i)).toBeInTheDocument();
  });

  it('stores the AI summary preference when the switch is toggled', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsGeneralTab />);

    const summarySwitch = screen.getByRole('checkbox', {
      name: /include ai summary with transcripts/i,
    });

    expect(advancedSettings$.getState().includeTranscriptionSummary).toBe(true);

    await user.click(summarySwitch);

    expect(advancedSettings$.getState().includeTranscriptionSummary).toBe(false);
  });

  it('hides the AI summary setting when post-call transcription is not allowed', () => {
    env.partialUpdate({ ALLOW_POST_CALL_TRANSCRIPTION: false });

    render(<AdvancedSettingsGeneralTab />);

    expect(screen.queryByText(/include ai summary with transcripts/i)).not.toBeInTheDocument();
  });
});
