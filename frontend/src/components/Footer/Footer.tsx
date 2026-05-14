import type { ReactElement } from 'react';
import FooterLinks from '@components/FooterLinks';

/**
 * Footer Component
 *
 * This component returns a footer displaying footer links.
 * @returns {ReactElement} - the footer component.
 */
const Footer = (): ReactElement => {
  return (
    <footer
      data-testid="footer-content"
      className="flex flex-row items-center bg-vera-surface vera-desktop:bg-vera-background"
    >
      <div className="hidden vera-desktop:block flex-1 bg-vera-surface min-h-15" />

      <div className="flex flex-1 justify-center bg-vera-surface vera-desktop:bg-vera-background">
        <FooterLinks />
      </div>
    </footer>
  );
};

export default Footer;
