import { ReactElement } from 'react';
import { CircularProgress } from '@mui/material';
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
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center justify-center space-x-3">
        <CircularProgress
          size={24}
          sx={{
            color: '#3b82f6',
          }}
        />
        <div className="text-center">
          <h4 className="font-medium text-blue-800">{t('precallTest.testingInProgress')}</h4>
        </div>
      </div>
    </div>
  );
};

export default TestProgress;
