import { ReactElement } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { checkSystemRequirements } from '@vonage/client-sdk-video';

/**
 * This component checks whether the user's browser is supported by the Vonage Video API.
 * If the browser is unsupported, users are redirected to the unsupported browser page.
 * @param {RedirectToUnsupportedBrowserPageProps} props - The props for this component.
 * @returns {ReactElement} - The redirect to unsupported browser page component.
 */
const RedirectToUnsupportedBrowserPage = (): ReactElement => {
  const isSupportedBrowser = checkSystemRequirements() === 1;

  return isSupportedBrowser ? (
    <Outlet />
  ) : (
    <Navigate
      to={{
        pathname: '/unsupported-browser',
      }}
    />
  );
};

export default RedirectToUnsupportedBrowserPage;
