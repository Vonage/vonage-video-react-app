import React from 'react';
import Stack from '../Stack';
import Box from '../Box';
import { BoxProps } from '@mui/material';
import isFunction from 'lodash/isFunction';
import useTheme from '../theme';

type WithChildren = { children: React.ReactNode };

type PageLayoutProps = BoxProps;

export enum PageLayoutRegions {
  Banner = 'Banner',
  Left = 'Left',
  Right = 'Right',
  Footer = 'Footer',
}

const PageLayout = ({ children, sx, ...props }: PageLayoutProps): React.ReactNode => {
  const theme = useTheme();

  const childrenArray = React.Children.toArray(children);

  const banner = pickChild(childrenArray, PageLayoutRegions.Banner);
  const left = pickChild(childrenArray, PageLayoutRegions.Left);
  const right = pickChild(childrenArray, PageLayoutRegions.Right);
  const footer = pickChild(childrenArray, PageLayoutRegions.Footer);

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        gap: { xs: 4, sm: 'unset' },
        ...sx,
      }}
      {...props}
    >
      {banner}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          gap: { xs: 2, md: 0 },
          display: 'flex',
          flex: 2,
          width: '100%',
          mt: 2,
        }}
      >
        {left && (
          <Box
            sx={{
              flex: { xs: 0, md: 1 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: { xs: theme.colors.surface, md: theme.colors.surface },
              overflow: 'hidden',
              px: { xs: 3, sm: 5 },
            }}
          >
            {left}
          </Box>
        )}

        {right && (
          <Box
            sx={{
              flex: { xs: 0, md: 1 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: { xs: theme.colors.surface, md: theme.colors.background },
              px: { xs: 3, sm: 5 },
            }}
          >
            {right}
          </Box>
        )}
      </Stack>

      {footer}
    </Box>
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

PageLayoutBanner.displayName = PageLayoutRegions.Banner;
PageLayoutLeft.displayName = PageLayoutRegions.Left;
PageLayoutRight.displayName = PageLayoutRegions.Right;
PageLayoutFooter.displayName = PageLayoutRegions.Footer;

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
 * Footer displayed at the bottom of the layout
 */
PageLayout.Footer = PageLayoutFooter;

function pickChild(children: React.ReactNode[], identifier: PageLayoutRegions): React.ReactNode {
  return (
    children.find((child: unknown) => {
      const isValidElement = React.isValidElement(child) && isFunction(child.type);
      if (!isValidElement) return false;

      return (child.type as React.ComponentType).displayName === identifier;
    }) ?? null
  );
}

export default PageLayout;
