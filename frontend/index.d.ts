import type React from 'react';

declare namespace JSX {
  interface IntrinsicElements {
    'vwc-icon': React.ComponentType<{
        size: -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;
        name: string;
    }>;
  }
}