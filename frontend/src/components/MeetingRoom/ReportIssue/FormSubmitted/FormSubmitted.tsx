import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import useTheme from '@ui/theme';

export type TicketResponseType = {
  message: string;
  ticketUrl: string;
};

export type FormSubmittedProps = {
  handleCloseFormSubmitted: () => void;
  ticketResponse: TicketResponseType;
};

/**
 * FormSubmitted Component
 *
 * This component displays either a success message upon form submission, or an error if there was one encountered.
 * @param {FormSubmittedProps} props - the props for the component.
 *  @property {() => void} handleCloseFormSubmitted - the function handling closing component upon form submission.
 *  @property {TicketResponseType} ticketResponse - the field containing response from the backend.
 * @returns {ReactElement} The form submitted component.
 */

const FormSubmitted = ({
  handleCloseFormSubmitted,
  ticketResponse,
}: FormSubmittedProps): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          minHeight: '80vh',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Box
          sx={{
            ml: 2,
            mr: 2,
            mb: 2,
            textAlign: 'center',
            width: '100%',
            display: 'block',
          }}
        >
          {ticketResponse.ticketUrl ? (
            <Box component="span">
              <Typography data-testid="thank-you-text" variant="h6" sx={{ mb: 1 }}>
                {t('feedbackForm.submitted.thanks')}
              </Typography>
              <Typography variant="body2" data-testid="submitted-content-text">
                {t('feedbackForm.submitted.content')}
              </Typography>
              <Typography variant="body2" data-testid="message-text" sx={{ mb: 1.5 }}>
                {ticketResponse.message}
              </Typography>
              <Link
                data-testid="track-progress-text"
                href={ticketResponse.ticketUrl}
                target="_blank"
                rel="noreferrer"
                sx={{
                  color: theme.colors.information,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {t('feedbackForm.submitted.track')}
              </Link>
            </Box>
          ) : (
            <Typography
              variant="body1"
              data-testid="error-text"
              sx={{ color: theme.colors.textSecondary }}
            >
              {t('feedbackForm.submitted.error')}
            </Typography>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
        }}
      >
        <Button
          type="submit"
          variant="contained"
          fullWidth
          data-testid="close-button-form-submitted"
          onClick={handleCloseFormSubmitted}
          sx={{
            textTransform: 'none',
            fontSize: '1rem',
            ml: 4,
            mr: 4,
            mb: 3,
          }}
        >
          {t('button.close')}
        </Button>
      </Box>
    </>
  );
};

export default FormSubmitted;
