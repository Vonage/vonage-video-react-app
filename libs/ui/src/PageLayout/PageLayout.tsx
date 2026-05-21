import React from 'react';
import { findSlotByDisplayName } from '../helpers';
import { twMerge } from 'tailwind-merge';

type WithChildren = { children: React.ReactNode };

export type PageLayoutProps = React.ComponentProps<'section'>;

export enum PageLayoutSlots {
  Banner = 'PageLayout.Banner',
  Left = 'PageLayout.Left',
  Right = 'PageLayout.Right',
  Footer = 'PageLayout.Footer',
}

const PageLayout = ({ children, className, ...props }: PageLayoutProps): React.ReactNode => {
  const childrenArray = React.Children.toArray(children);

  const banner = findSlotByDisplayName({
    children: childrenArray,
    displayName: PageLayoutSlots.Banner,
  });

  const left = findSlotByDisplayName({
    children: childrenArray,
    displayName: PageLayoutSlots.Left,
  });

  const right = findSlotByDisplayName({
    children: childrenArray,
    displayName: PageLayoutSlots.Right,
  });

  const footer = findSlotByDisplayName({
    children: childrenArray,
    displayName: PageLayoutSlots.Footer,
  });

  return (
    <section className={twMerge('flex flex-col min-h-screen max-sm:gap-8', className)} {...props}>
      {banner}

      <div className="flex flex-col vera-desktop:flex-row gap-4 vera-desktop:gap-0 flex-2 w-full mt-4">
        {left && (
          <div className="bg-vera-surface flex-none vera-desktop:flex-1 flex items-center justify-center overflow-hidden max-sm:px-0 px-10">
            {left}
          </div>
        )}

        {right && (
          <div className="bg-vera-surface vera-desktop:bg-vera-background flex-none vera-desktop:flex-1 flex items-center justify-center py-2 px-6 vera-desktop:px-10">
            {right}
          </div>
        )}
      </div>

      {footer}
    </section>
  );
};

const PageLayoutBanner: React.FC<WithChildren> = ({ children }) => {
  return children;
};

const PageLayoutLeft: React.FC<WithChildren> = ({ children }) => {
  return children;
};

const PageLayoutRight: React.FC<WithChildren> = ({ children }) => {
  return children;
};

const PageLayoutFooter: React.FC<WithChildren> = ({ children }) => {
  return children;
};

PageLayoutBanner.displayName = PageLayoutSlots.Banner;
PageLayoutLeft.displayName = PageLayoutSlots.Left;
PageLayoutRight.displayName = PageLayoutSlots.Right;
PageLayoutFooter.displayName = PageLayoutSlots.Footer;

/**
 * Banner that will be displayed at the top of the layout
 */
PageLayout.Banner = PageLayoutBanner;

/**
 * Content for the left column
 */
PageLayout.Left = PageLayoutLeft;

/**
 * Content for the right column
 */
PageLayout.Right = PageLayoutRight;

/**
 * Content for the footer
 */
PageLayout.Footer = PageLayoutFooter;

export default PageLayout;
