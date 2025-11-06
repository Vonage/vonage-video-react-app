import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Box, Paper } from '@mui/material';
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
    <Paper className="mb-6 p-4 text-left">
      <Typography variant="h6" className="mb-2 font-bold">
        {t('precallTest.qualityResults')}
      </Typography>

      {results.audio && (
        <Box className="mb-2">
          <Typography variant="subtitle1" className="font-semibold">
            {t('precallTest.audio')}:
          </Typography>
          <Typography variant="body2">
            {t('precallTest.supported')}: {results.audio.supported ? '✅' : '❌'}
          </Typography>
          {results.audio.mos && (
            <Typography variant="body2">
              {t('precallTest.qualityScore')}: {results.audio.mos.toFixed(2)}
            </Typography>
          )}
        </Box>
      )}

      {results.video && (
        <Box>
          <Typography variant="subtitle1" className="font-semibold">
            {t('precallTest.video')}:
          </Typography>
          <Typography variant="body2">
            {t('precallTest.supported')}: {results.video.supported ? '✅' : '❌'}
          </Typography>
          {results.video.mos && (
            <Typography variant="body2">
              {t('precallTest.qualityScore')}: {results.video.mos.toFixed(2)}
            </Typography>
          )}
          {results.video.recommendedResolution && (
            <Typography variant="body2">
              {t('precallTest.recommended')}: {results.video.recommendedResolution}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default QualityResults;
