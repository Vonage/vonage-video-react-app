import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import advancedSettings$ from '@Context/AdvancedSettings';
import AdvancedSettingsCaptionsTab from './AdvancedSettingsCaptionsTab';

describe('AdvancedSettingsCaptionsTab', () => {
  beforeEach(() => {
    advancedSettings$.reset();
  });

  it('follows the UI language by default', () => {
    render(<AdvancedSettingsCaptionsTab />);

    expect(screen.getByTestId('advanced-settings-captions-input-language')).toHaveValue('followUi');
    expect(screen.getByTestId('advanced-settings-captions-translation-language')).toHaveValue(
      'original'
    );
  });

  it('stores the selected spoken language and clears it when reverting to follow UI', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsCaptionsTab />);
    const select = screen.getByTestId('advanced-settings-captions-input-language');

    await user.selectOptions(select, 'ja-JP');

    expect(advancedSettings$.getState().captionsInputLanguage).toBe('ja-JP');

    await user.selectOptions(select, 'followUi');

    expect(advancedSettings$.getState().captionsInputLanguage).toBeNull();
  });

  it('stores the selected translation language and clears it when reverting to original', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsCaptionsTab />);
    const select = screen.getByTestId('advanced-settings-captions-translation-language');

    await user.selectOptions(select, 'es-ES');

    expect(advancedSettings$.getState().captionsTranslationLanguage).toBe('es-ES');

    await user.selectOptions(select, 'original');

    expect(advancedSettings$.getState().captionsTranslationLanguage).toBeNull();
  });
});
