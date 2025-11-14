import { ReactElement } from 'react';
import FlexLayout from '@ui/FlexLayout';
import Banner from '@components/Banner';
import Footer from '@components/Footer/Footer';
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
    <FlexLayout>
      <FlexLayout.Banner>
        <Banner />
      </FlexLayout.Banner>
      <FlexLayout.Left>
        <UnsupportedBrowserMessage />
      </FlexLayout.Left>
      <FlexLayout.Right>
        <SupportedBrowsers />
      </FlexLayout.Right>
      <FlexLayout.Footer>
        <Footer />
      </FlexLayout.Footer>
    </FlexLayout>
  );
};

export default UnsupportedBrowserPage;
