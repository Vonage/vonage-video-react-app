import type { PropsWithChildren, ReactElement } from 'react';
import { PageLayout } from '@ui';
import Banner from '@components/Banner';
import Footer from '@components/Footer/Footer';
import LandingPageWelcome from '@components/LandingPageWelcome';

/**
 * The current landing page frame (banner, welcome text, footer) with custom content in the right column.
 */
const LandingShell = ({ children }: PropsWithChildren): ReactElement => {
  return (
    <PageLayout>
      <PageLayout.Banner>
        <Banner />
      </PageLayout.Banner>
      <PageLayout.Left>
        <LandingPageWelcome />
      </PageLayout.Left>
      <PageLayout.Right>{children}</PageLayout.Right>
      <PageLayout.Footer>
        <Footer />
      </PageLayout.Footer>
    </PageLayout>
  );
};

export default LandingShell;
