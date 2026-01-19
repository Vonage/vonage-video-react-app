import type { ComponentProps } from 'react';

import {
  BrowserRouter as ReactBrowserRouter,
  MemoryRouter as ReactMemoryRouter,
} from 'react-router-dom';

const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

export const BrowserRouter = (props: ComponentProps<typeof ReactBrowserRouter>) => {
  return <ReactBrowserRouter {...props} future={routerFutureConfig} />;
};

const MemoryRouter = (props: ComponentProps<typeof ReactMemoryRouter>) => {
  return <ReactMemoryRouter {...props} future={routerFutureConfig} />;
};

export default MemoryRouter;
