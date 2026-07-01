import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { BoxProps } from '@mui/material/Box';
import { isFunction } from '@common/assertions';

type WithChildren = { children: React.ReactNode };

export type PageLayoutEmbedProps = BoxProps;

export enum PageLayoutEmbedRegions {
  Banner = 'Banner',
  Left = 'Left',
  Right = 'Right',
  Footer = 'Footer',
}

const PageLayoutEmbed = ({ children, sx, ...props }: PageLayoutEmbedProps): React.ReactNode => {
  const childrenArray = React.Children.toArray(children);

  const left = pickChild(childrenArray, PageLayoutEmbedRegions.Left);
  const right = pickChild(childrenArray, PageLayoutEmbedRegions.Right);

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        ...sx,
      }}
      {...props}
    >
      <Stack
        className="bg-vera-surface"
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          display: { xs: 'block', md: 'flex' },
          flex: 1,
          minHeight: 0,
          width: '100%',
          overflow: 'auto',
        }}
      >
        {left && (
          <Box
            className="bg-vera-surface"
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pt: { xs: 2, md: 0 },
              px: { xs: 0, md: 5 },
            }}
          >
            {left}
          </Box>
        )}

        {right && (
          <Box
            className="bg-vera-surface vera-desktop:bg-vera-background"
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 1,
              px: { xs: 3, sm: 5 },
            }}
          >
            {right}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

const PageLayoutEmbedLeft: React.FC<WithChildren> = ({ children }) => {
  return children;
};

const PageLayoutEmbedRight: React.FC<WithChildren> = ({ children }) => {
  return children;
};

PageLayoutEmbedLeft.displayName = PageLayoutEmbedRegions.Left;
PageLayoutEmbedRight.displayName = PageLayoutEmbedRegions.Right;

/**
 * Content for the left column
 */
PageLayoutEmbed.Left = PageLayoutEmbedLeft;

/**
 * Content for the right column
 */
PageLayoutEmbed.Right = PageLayoutEmbedRight;

function pickChild(
  children: React.ReactNode[],
  identifier: PageLayoutEmbedRegions
): React.ReactNode {
  return (
    children.find((child: unknown) => {
      const isValidElement = React.isValidElement(child) && isFunction(child.type);
      if (!isValidElement) return false;

      return (child.type as React.ComponentType).displayName === identifier;
    }) ?? null
  );
}

export default PageLayoutEmbed;
