import React, { ComponentProps, ReactElement } from 'react';
import classNames from 'classnames';
import BannerDateTime from '../BannerDateTime';
import BannerLinks from '../BannerLinks';
import BannerLogo from '../BannerLogo';
import BannerLanguage from '../BannerLanguage';

type BannerProps = ComponentProps<'div'>;

/**
 * Banner Component
 *
 * This component returns a banner that includes a logo, current date/time, language selector, and some links.
 * @param root0 - Props for the Banner component.
 * @param {string} root0.className - Additional CSS class names to apply to the banner container.
 * @returns {ReactElement} - the banner component.
 */
const Banner: React.FC<BannerProps> = ({ className, ...props }) => {
  return (
    <div className={classNames('flex w-full flex-row justify-between', className)} {...props}>
      <BannerLogo />

      <div className="flex px-4">
        <BannerDateTime />
        <BannerLanguage />
        <BannerLinks />
      </div>
    </div>
  );
};

export default Banner;
