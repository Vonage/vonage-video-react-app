import { ReactElement } from 'react';
import { CircularProgress, Paper, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * TestProgress Component
 *
 * This component displays the progress of the network test with a spinner.
 * @returns {ReactElement} The test progress component.
 */
const TestProgress = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <Paper
      className="mb-6"
      sx={{
        p: 2,
        border: '0.5px solid #bfdbfe',
        backgroundColor: '#eff6ff',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
        <CircularProgress size={24} sx={{ color: '#3b82f6' }} />
        <Typography variant="subtitle1" fontWeight="medium" sx={{ color: '#1e40af' }}>
          {t('precallTest.testingInProgress')}
        </Typography>
      </Box>
    </Paper>
  );
};

export default TestProgress;
