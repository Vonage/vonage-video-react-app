import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectivityResults as ConnectivityResultsType } from '../../../hooks/useNetworkTest';

export type ConnectivityResultsProps = {
  results: ConnectivityResultsType;
};

/**
 * ConnectivityResults Component
 *
 * This component displays the results of the connectivity test.
 * @param {ConnectivityResultsProps} props - The props for the component.
 * @property {ConnectivityResultsType} results - The connectivity test results to display.
 * @returns {ReactElement} The connectivity results component.
 */
const ConnectivityResults = ({ results }: ConnectivityResultsProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 rounded-lg border bg-white p-4 text-left">
      <h3 className="mb-2 font-bold">{t('precallTest.connectivityResults')}</h3>
      <p>
        {t('precallTest.status')}:{' '}
        {results.success ? `✅ ${t('precallTest.success')}` : `❌ ${t('precallTest.failed')}`}
      </p>
      {results.failedTests && results.failedTests.length > 0 && (
        <div className="mt-2">
          <h4 className="font-semibold">{t('precallTest.issues')}:</h4>
          {results.failedTests.map((test) => (
            <div key={test.type} className="ml-4 text-sm">
              <p>
                {test.type}: {test.error.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectivityResults;
