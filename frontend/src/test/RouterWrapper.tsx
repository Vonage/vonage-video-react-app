import type { ComponentProps } from 'react';

import {
  BrowserRouter as ReactBrowserRouter,
  MemoryRouter as ReactMemoryRouter,
} from 'react-router-dom';

export const BrowserRouter = (props: ComponentProps<typeof ReactBrowserRouter>) => {
  return <ReactBrowserRouter {...props} />;
};

const MemoryRouter = (props: ComponentProps<typeof ReactMemoryRouter>) => {
  return <ReactMemoryRouter {...props} />;
};

export default MemoryRouter;
