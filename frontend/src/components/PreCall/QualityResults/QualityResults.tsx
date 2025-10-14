import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { QualityResults as QualityResultsType } from '../../../hooks/useNetworkTest';

export type QualityResultsProps = {
  results: QualityResultsType;
};

/**
 * QualityResults Component
 *
 * This component displays the results of the quality test.
 * @param {QualityResultsProps} props - The props for the component.
 * @property {QualityResultsType} results - The quality test results to display.
 * @returns {ReactElement} The quality results component.
 */
const QualityResults = ({ results }: QualityResultsProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 rounded-lg border bg-white p-4 text-left">
      <h3 className="mb-2 font-bold">{t('precallTest.qualityResults')}</h3>

      {results.audio && (
        <div className="mb-2">
          <h4 className="font-semibold">{t('precallTest.audio')}:</h4>
          <p>
            {t('precallTest.supported')}: {results.audio.supported ? '✅' : '❌'}
          </p>
          {results.audio.mos && (
            <p>
              {t('precallTest.qualityScore')}: {results.audio.mos.toFixed(2)}
            </p>
          )}
        </div>
      )}

      {results.video && (
        <div>
          <h4 className="font-semibold">{t('precallTest.video')}:</h4>
          <p>
            {t('precallTest.supported')}: {results.video.supported ? '✅' : '❌'}
          </p>
          {results.video.mos && (
            <p>
              {t('precallTest.qualityScore')}: {results.video.mos.toFixed(2)}
            </p>
          )}
          {results.video.recommendedResolution && (
            <p>
              {t('precallTest.recommended')}: {results.video.recommendedResolution}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QualityResults;
