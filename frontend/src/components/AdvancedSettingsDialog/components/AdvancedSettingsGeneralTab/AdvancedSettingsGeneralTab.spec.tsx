import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { env } from '../../../../env';
import AdvancedSettingsGeneralTab from './AdvancedSettingsGeneralTab';

describe('AdvancedSettingsGeneralTab', () => {
  it('renders the general tab content', () => {
    render(<AdvancedSettingsGeneralTab />);

    expect(screen.getByRole('heading', { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset default values/i })).toBeInTheDocument();
    expect(screen.getByText(/restore all settings to their default values/i)).toBeInTheDocument();
  });

  it('shows the AI summary setting when post-call transcription is allowed', () => {
    env.partialUpdate({ ALLOW_POST_CALL_TRANSCRIPTION: true });

    render(<AdvancedSettingsGeneralTab />);

    expect(screen.getByText(/include ai summary with transcripts/i)).toBeInTheDocument();
  });

  it('hides the AI summary setting when post-call transcription is not allowed', () => {
    env.partialUpdate({ ALLOW_POST_CALL_TRANSCRIPTION: false });

    render(<AdvancedSettingsGeneralTab />);

    expect(screen.queryByText(/include ai summary with transcripts/i)).not.toBeInTheDocument();
  });
});
