import { ReactElement } from 'react';
import PageLayout from '@ui/PageLayout';
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
    <PageLayout>
      <PageLayout.Banner>
        <Banner />
      </PageLayout.Banner>
      <PageLayout.Left>
        <UnsupportedBrowserMessage />
      </PageLayout.Left>
      <PageLayout.Right>
        <SupportedBrowsers />
      </PageLayout.Right>
      <PageLayout.Footer>
        <Footer />
      </PageLayout.Footer>
    </PageLayout>
  );
};

export default UnsupportedBrowserPage;
