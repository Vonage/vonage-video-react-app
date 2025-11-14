import * as React from 'react';
import Stack from '@ui/Stack';
import Box from '@ui/Box';

type WithChildren<T = object> = T & { children?: React.ReactNode };

export type FlexLayoutProps = WithChildren<{
  padding?: number;
  leftFlex?: number;
  rightFlex?: number;
  leftAlign?: { alignItems: string; justifyContent: string };
  rightAlign?: { alignItems: string; justifyContent: string };
  leftBackgroundColor?: string | { [key: string]: string };
  rightBackgroundColor?: string | { [key: string]: string };
}>;

export const FlexLayoutBanner: React.FC<WithChildren> = ({ children }) => {
  return children;
};
FlexLayoutBanner.displayName = 'FlexLayoutBanner';

export const FlexLayoutLeft: React.FC<WithChildren> = ({ children }) => {
  return children;
};
FlexLayoutLeft.displayName = 'FlexLayoutLeft';

export const FlexLayoutRight: React.FC<WithChildren> = ({ children }) => {
  return children;
};
FlexLayoutRight.displayName = 'FlexLayoutRight';

function pickChild(children: React.ReactNode, displayName: string): React.ReactNode | null {
  const arr = React.Children.toArray(children);

  return (
    arr.find(
      (child: unknown) =>
        React.isValidElement(child) &&
        typeof child.type === 'function' &&
        'displayName' in child.type &&
        (child.type as React.ComponentType).displayName === displayName
    ) ?? null
  );
}

type FlexLayoutComponent = React.FC<FlexLayoutProps> & {
  Banner: typeof FlexLayoutBanner;
  Left: typeof FlexLayoutLeft;
  Right: typeof FlexLayoutRight;
};

const FlexLayout: FlexLayoutComponent = ({
  children,
  padding = 3,
  leftFlex = 1,
  rightFlex = 1,
  leftAlign = { alignItems: 'center', justifyContent: 'center' },
  rightAlign = { alignItems: 'center', justifyContent: 'center' },
  leftBackgroundColor = { xs: 'background.paper', md: 'background.paper' },
  rightBackgroundColor = { xs: 'background.paper', md: 'primary.light' },
}: FlexLayoutProps) => {
  const banner = pickChild(children, 'FlexLayoutBanner');
  const left = pickChild(children, 'FlexLayoutLeft');
  const right = pickChild(children, 'FlexLayoutRight');

  return (
    <Box component="section" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {banner && <Box>{banner}</Box>}
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
              flex: leftFlex,
              display: 'flex',
              alignItems: leftAlign.alignItems,
              justifyContent: leftAlign.justifyContent,
              p: padding,
              bgcolor: leftBackgroundColor,
              overflow: 'hidden',
            }}
          >
            {left}
          </Box>
        )}

        {right && (
          <Box
            sx={{
              flex: rightFlex,
              display: 'flex',
              alignItems: rightAlign.alignItems,
              justifyContent: rightAlign.justifyContent,
              p: padding,
              bgcolor: rightBackgroundColor,
            }}
          >
            {right}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

FlexLayout.Banner = FlexLayoutBanner;
FlexLayout.Left = FlexLayoutLeft;
FlexLayout.Right = FlexLayoutRight;

export default FlexLayout;
