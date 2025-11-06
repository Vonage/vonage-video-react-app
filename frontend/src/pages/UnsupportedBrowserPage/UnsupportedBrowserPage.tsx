import { ReactElement } from 'react';
import GridLayout from '@ui/FlexLayout';
import Banner from '@components/Banner';
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
    <GridLayout>
      <GridLayout.Banner>
        <Banner />
      </GridLayout.Banner>
      <GridLayout.Left>
        <UnsupportedBrowserMessage />
      </GridLayout.Left>
      <GridLayout.Right>
        <SupportedBrowsers />
      </GridLayout.Right>
    </GridLayout>
  );
};

export default UnsupportedBrowserPage;
