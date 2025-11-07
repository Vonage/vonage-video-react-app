import { ReactElement } from 'react';
import useIsTabletViewport from '@hooks/useIsTabletViewport';
import Box from '@ui/Box';
import Typography from '@ui/Typography';
import useDateTime from '../../hooks/useDateTime';

/**
 * This component returns a UI that includes current time and date.
 * Returns a banner with a date and time component, or null on tablet viewports.
 * @returns {ReactElement | null} - the banner with a date and time component, or null on tablet viewports
 */
const BannerDateTime = (): ReactElement | null => {
  const { date, time } = useDateTime();
  const isTablet = useIsTabletViewport();

  if (isTablet) {
    return null;
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      data-testid="dateAndTime"
      sx={(theme) => ({ color: theme.palette.text.light })}
    >
      <Typography variant="body1" component="span" sx={{ mr: 1 }} data-testid="current-time">
        {time}
      </Typography>

      <Typography variant="body1" component="span" sx={{ mr: 1 }}>
        •
      </Typography>

      <Typography variant="body1" component="span" sx={{ mr: 1 }} data-testid="current-date">
        {date}
      </Typography>
    </Box>
  );
};

export default BannerDateTime;
