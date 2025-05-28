import { Typography, Button } from '@mui/material';
import { ReactElement } from 'react';

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
  return (
    <>
      <div className="flex min-h-[80vh] items-center justify-between overflow-y-auto overflow-x-hidden">
        <Typography
          variant="body2"
          color="textPrimary"
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
            <>
              <b data-testid="thank-you-text">Thank you for your feedback!</b>
              <br />
              We greatly appreciate your input, as it helps us improve the app and address any
              issues.
              <br />
              {ticketResponse.message} <br />
              <a
                data-testid="track-progress-text"
                href={ticketResponse.ticketUrl}
                target="_blank"
                style={{
                  color: '#0B57D0',
                  fontWeight: 'bold',
                }}
                rel="noreferrer"
              >
                Track your progress here.
              </a>
            </>
          ) : (
            <span data-testid="error-text">
              Something went wrong. Please try again.
              <br />
            </span>
          )}
        </Typography>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex">
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
          Close
        </Button>
      </div>
    </>
  );
};

export default FormSubmitted;
