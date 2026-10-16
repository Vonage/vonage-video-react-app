import { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import SuspenseBoundary from '@web/components/SuspenseBoundary';
import ErrorBoundary from '../ErrorBoundary';

export type LazyLoadBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

const defaultFallback = (
  <Box className="flex h-full items-center justify-center p-4">
    <CircularProgress />
  </Box>
);

/**
 * Wraps a React.lazy() component so a failed chunk fetch (e.g. a transient network error, or a
 * stale hash after a redeploy) shows a retry UI for that subtree instead of throwing up to the
 * nearest ancestor boundary and tearing down everything above it.
 *
 * React.lazy() caches a rejected import forever, so retrying reloads the page instead.
 */
const LazyLoadBoundary = ({
  children,
  fallback = defaultFallback,
}: LazyLoadBoundaryProps): ReactElement => {
  return (
    <ErrorBoundary fallback={() => <LazyLoadBoundaryFallback />}>
      <SuspenseBoundary fallback={fallback}>{children}</SuspenseBoundary>
    </ErrorBoundary>
  );
};

function LazyLoadBoundaryFallback(): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-2 p-4 text-vera-body-base text-vera-on-surface">
      <span>{t('lazyLoadBoundary.failed')}</span>
      <Button variant="outlined" onClick={() => window.location.reload()}>
        {t('lazyLoadBoundary.retry')}
      </Button>
    </div>
  );
}

export default LazyLoadBoundary;
