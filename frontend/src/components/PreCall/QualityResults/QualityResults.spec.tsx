import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import QualityResults from './QualityResults';
import { QualityResults as QualityResultsType } from '../../../hooks/useNetworkTest';
import enTranslations from '../../../locales/en.json';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'precallTest.qualityResults': enTranslations['precallTest.qualityResults'],
        'precallTest.audio': enTranslations['precallTest.audio'],
        'precallTest.video': enTranslations['precallTest.video'],
        'precallTest.supported': enTranslations['precallTest.supported'],
        'precallTest.qualityScore': enTranslations['precallTest.qualityScore'],
        'precallTest.recommended': enTranslations['precallTest.recommended'],
      };
      return translations[key] || key;
    },
  }),
}));

describe('QualityResults', () => {
  it('renders the quality results title', () => {
    const mockResults: QualityResultsType = {};

    render(<QualityResults results={mockResults} />);

    expect(screen.getByText(enTranslations['precallTest.qualityResults'])).toBeInTheDocument();
  });

  it('renders audio results when audio data is provided', () => {
    const mockResults: QualityResultsType = {
      audio: {
        supported: true,
        mos: 4.2,
      },
    };

    render(<QualityResults results={mockResults} />);

    expect(screen.getByText(`${enTranslations['precallTest.audio']}:`)).toBeInTheDocument();
    expect(screen.getByText(`${enTranslations['precallTest.supported']}: ✅`)).toBeInTheDocument();
    expect(
      screen.getByText(`${enTranslations['precallTest.qualityScore']}: 4.20`)
    ).toBeInTheDocument();
  });

  it('renders video results when video data is provided', () => {
    const mockResults: QualityResultsType = {
      video: {
        supported: true,
        mos: 3.8,
        recommendedResolution: '640x480',
      },
    };

    render(<QualityResults results={mockResults} />);

    expect(screen.getByText(`${enTranslations['precallTest.video']}:`)).toBeInTheDocument();
    expect(screen.getByText(`${enTranslations['precallTest.supported']}: ✅`)).toBeInTheDocument();
    expect(
      screen.getByText(`${enTranslations['precallTest.qualityScore']}: 3.80`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${enTranslations['precallTest.recommended']}: 640x480`)
    ).toBeInTheDocument();
  });

  it('renders both audio and video results when both are provided', () => {
    const mockResults: QualityResultsType = {
      audio: {
        supported: false,
        mos: 2.1,
      },
      video: {
        supported: true,
        mos: 4.5,
        recommendedResolution: '1280x720',
      },
    };

    render(<QualityResults results={mockResults} />);

    expect(screen.getByText(`${enTranslations['precallTest.audio']}:`)).toBeInTheDocument();
    expect(screen.getByText(`${enTranslations['precallTest.supported']}: ❌`)).toBeInTheDocument();
    expect(
      screen.getByText(`${enTranslations['precallTest.qualityScore']}: 2.10`)
    ).toBeInTheDocument();

    expect(screen.getByText(`${enTranslations['precallTest.video']}:`)).toBeInTheDocument();
    expect(screen.getByText(`${enTranslations['precallTest.supported']}: ✅`)).toBeInTheDocument();
    expect(
      screen.getByText(`${enTranslations['precallTest.qualityScore']}: 4.50`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${enTranslations['precallTest.recommended']}: 1280x720`)
    ).toBeInTheDocument();
  });

  it('handles audio results without MOS score', () => {
    const mockResults: QualityResultsType = {
      audio: {
        supported: true,
      },
    };

    render(<QualityResults results={mockResults} />);

    expect(screen.getByText(`${enTranslations['precallTest.audio']}:`)).toBeInTheDocument();
    expect(screen.getByText(`${enTranslations['precallTest.supported']}: ✅`)).toBeInTheDocument();
    expect(
      screen.queryByText(new RegExp(enTranslations['precallTest.qualityScore']))
    ).not.toBeInTheDocument();
  });

  it('handles video results without MOS score and recommended resolution', () => {
    const mockResults: QualityResultsType = {
      video: {
        supported: false,
      },
    };

    render(<QualityResults results={mockResults} />);

    expect(screen.getByText(`${enTranslations['precallTest.video']}:`)).toBeInTheDocument();
    expect(screen.getByText(`${enTranslations['precallTest.supported']}: ❌`)).toBeInTheDocument();
    expect(
      screen.queryByText(new RegExp(enTranslations['precallTest.qualityScore']))
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(new RegExp(enTranslations['precallTest.recommended']))
    ).not.toBeInTheDocument();
  });

  it('renders empty results without audio or video data', () => {
    const mockResults: QualityResultsType = {};

    render(<QualityResults results={mockResults} />);

    expect(screen.getByText(enTranslations['precallTest.qualityResults'])).toBeInTheDocument();
    expect(
      screen.queryByText(new RegExp(enTranslations['precallTest.audio']))
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(new RegExp(enTranslations['precallTest.video']))
    ).not.toBeInTheDocument();
  });

  it('formats MOS scores to 2 decimal places', () => {
    const mockResults: QualityResultsType = {
      audio: {
        supported: true,
        mos: 3.14159,
      },
      video: {
        supported: true,
        mos: 2.7,
      },
    };

    render(<QualityResults results={mockResults} />);

    expect(
      screen.getByText(`${enTranslations['precallTest.qualityScore']}: 3.14`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${enTranslations['precallTest.qualityScore']}: 2.70`)
    ).toBeInTheDocument();
  });
});
