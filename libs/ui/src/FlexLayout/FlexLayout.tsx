import React from 'react';
import Stack from '../Stack';
import Box from '../Box';
import { BoxProps } from '@mui/material';
import isFunction from 'lodash/isFunction';
import useTheme from '../theme';

type WithChildren = { children: React.ReactNode };

type FlexLayoutProps = BoxProps;

export enum FlexLayoutRegions {
  Banner = 'Banner',
  Left = 'Left',
  Right = 'Right',
  Footer = 'Footer',
}

const FlexLayout = ({ children, sx, ...props }: FlexLayoutProps): React.ReactNode => {
  const theme = useTheme();

  const childrenArray = React.Children.toArray(children);

  const banner = pickChild(childrenArray, FlexLayoutRegions.Banner);
  const left = pickChild(childrenArray, FlexLayoutRegions.Left);
  const right = pickChild(childrenArray, FlexLayoutRegions.Right);
  const footer = pickChild(childrenArray, FlexLayoutRegions.Footer);

  return (
    <Box
      component="section"
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', ...sx }}
      {...props}
    >
      {banner}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          display: { xs: 'block', md: 'flex' },
          flex: 1,
          width: '100%',
        }}
      >
        {left && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              bgcolor: { xs: theme.colors.surface, md: theme.colors.surface },
              overflow: 'hidden',
            }}
          >
            {left}
          </Box>
        )}

        {right && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              bgcolor: { xs: theme.colors.surface, md: theme.colors.background },
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

const FlexLayoutBanner: React.FC<WithChildren> = ({ children }) => {
  return children;
};

const FlexLayoutLeft: React.FC<WithChildren> = ({ children }) => {
  return children;
};

const FlexLayoutRight: React.FC<WithChildren> = ({ children }) => {
  return children;
};

const FlexLayoutFooter: React.FC<WithChildren> = ({ children }) => {
  return children;
};

FlexLayoutBanner.displayName = FlexLayoutRegions.Banner;
FlexLayoutLeft.displayName = FlexLayoutRegions.Left;
FlexLayoutRight.displayName = FlexLayoutRegions.Right;
FlexLayoutFooter.displayName = FlexLayoutRegions.Footer;

/**
 * Banner that will be displayed at the top of the layout
 */
FlexLayout.Banner = FlexLayoutBanner;

/**
 * Content for the left column
 */
FlexLayout.Left = FlexLayoutLeft;

/**
 * Content for the right column
 */
FlexLayout.Right = FlexLayoutRight;

/**
 * Content for the lef column
 */
FlexLayout.Footer = FlexLayoutFooter;

function pickChild(children: React.ReactNode[], identifier: FlexLayoutRegions): React.ReactNode {
  return (
    children.find((child: unknown) => {
      const isValidElement = React.isValidElement(child) && isFunction(child.type);
      if (!isValidElement) return false;

      return (child.type as React.ComponentType).displayName === identifier;
    }) ?? null
  );
}

export default FlexLayout;
