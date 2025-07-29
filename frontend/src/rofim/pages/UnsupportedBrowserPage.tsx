import { ReactElement } from 'react';
import SupportedBrowsers from '../../components/UnsupportedBrowser/SupportedBrowsers';
import UnsupportedBrowserMessage from '../../components/UnsupportedBrowser/UnsupportedBrowserMessage';

/**
 * UnsupportedBrowserPage
 *
 * This component renders the unsupported browser page of the application, including:
 * - A banner containing a company logo, a date-time widget, and a navigable button to a GitHub repo.
 * - A warning for users.
 * - A list of supported browsers with links to their download pages.
 * @returns {ReactElement} - The unsupported browser page.
 */
const UnsupportedBrowserPage = (): ReactElement => {
  return (
    <div className="flex size-full flex-col justify-between bg-white">
      <div className="flex size-full flex-col items-center bg-white md:flex-row md:justify-center">
        <UnsupportedBrowserMessage />
        <SupportedBrowsers />
      </div>
    </div>
  );
};

export default UnsupportedBrowserPage;
