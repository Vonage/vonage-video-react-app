import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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
        className="text-vera-text-secondary"
        sx={{
          width: { xs: '100%', md: '80%' },
          paddingBottom: 2,
        }}
        data-testid="header-message"
      >
        {header}
      </Typography>
      <Typography
        variant="h4"
        className="text-vera-text-tertiary"
        sx={{
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
