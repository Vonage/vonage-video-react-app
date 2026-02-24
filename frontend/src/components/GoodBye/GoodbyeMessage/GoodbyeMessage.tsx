import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@ui/theme';

export type GoodByeMessageProps = {
  header: string;
  message: string;
};

/**
 * GoodByeMessage Component
 * Displays a goodbye message to the user along with two navigation buttons - one to the previously left room, and another for the landing page.
 * @param {GoodByeMessageProps} props - The props for the component.
 * @returns {ReactElement} The GoodByeMessage component.
 */
const GoodByeMessage = ({ header, message }: GoodByeMessageProps): ReactElement => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: 'auto',
        width: '100%',
        flexShrink: 1,
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: { xs: 2, md: 6 },
        textAlign: 'left',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          width: { xs: '100%', md: '80%' },
          paddingBottom: 2,
          color: theme.colors.textSecondary,
        }}
        data-testid="header-message"
      >
        {header}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          color: theme.colors.textTertiary,
          display: { xs: 'none', sm: 'block' },
        }}
        data-testid="goodbye-message"
      >
        {message}
      </Typography>
    </Box>
  );
};

export default GoodByeMessage;
