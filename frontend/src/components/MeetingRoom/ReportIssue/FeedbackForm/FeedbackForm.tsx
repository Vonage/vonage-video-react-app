import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { FormEvent, ChangeEvent, ReactElement } from 'react';
import FilePicker from './FilePicker';
import {
  REPORT_TITLE_LIMIT,
  REPORT_DESCRIPTION_LIMIT,
  REPORT_NAME_LIMIT,
} from '../../../../utils/constants';
import HelperText from './HelperText';
import useIsSmallViewport from '../../../../hooks/useIsSmallViewport';

export type FormType = {
  title: string;
  name: string;
  issue: string;
};

export type ErrorFormType = {
  title: boolean;
  name: boolean;
  issue: boolean;
};

export type FeedbackFormType = {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  formData: FormType;
  errors: ErrorFormType;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  onFileSelect: (fileData: string) => void;
};

const getStyleTypography = () => {
  return {
    marginBottom: '5px',
    textAlign: 'left',
  };
};

/**
 * FeedbackForm Component
 *
 * This component contains a form that allows the user to add a title, their name, a short description of the issue
 * as well as attach a screenshot for the issue they have encountered while using the application.
 * @param {FeedbackFormType} props - the props for the component.
 *  @property {(event: FormEvent<HTMLFormElement>) => Promise<void>} handleSubmit - the function that handles form submission.
 *  @property {FormType} formData - the field containing the values from the form.
 *  @property {ErrorFormType} errors - the field containing the errors while user puts in the values in the form.
 *  @property {(event: ChangeEvent<HTMLInputElement>) => void} handleChange - the function that handles validating users' input.
 *  @property {boolean} loading - indicates whether the form is currently loading.
 *  @property {(fileData: string) => void} onFileSelect - the function that handles storing the file value.
 * @returns {ReactElement} The feedback form component.
 */
const FeedbackForm = ({
  handleSubmit,
  formData,
  errors,
  handleChange,
  loading,
  onFileSelect,
}: FeedbackFormType): ReactElement => {
  const isSmallViewport = useIsSmallViewport();
  const heightClass = '@apply h-[calc(100dvh_-_240px)]';
  const widthClass = isSmallViewport ? '@apply w-[calc(100dvw_-_48px)]' : '';

  const getColorStyle = (value: string, maxLength: number) => {
    return value.length >= maxLength || value.length === 0 ? 'red' : 'inherit';
  };

  return loading ? (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <form onSubmit={handleSubmit}>
      <div className={`flex flex-col overflow-y-auto overflow-x-hidden ${heightClass}`}>
        <Box ml="23px" mr="27px">
          <Typography
            variant="body2"
            data-testid="title-report-issue"
            color="textPrimary"
            sx={getStyleTypography()}
          >
            When you noticed this issue, what were you trying to do?
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            helperText={
              <HelperText
                colorStyle={getColorStyle(formData.title, REPORT_TITLE_LIMIT)}
                errorType="Title"
                textLimit={REPORT_TITLE_LIMIT}
                isError={errors.title}
                formText={formData.title}
                testId="title-error"
              />
            }
            sx={{
              mb: '22px',
            }}
            inputProps={{ maxLength: REPORT_TITLE_LIMIT }}
          />
          <Typography
            variant="body2"
            data-testid="name-report-issue"
            color="textPrimary"
            sx={getStyleTypography()}
          >
            Tell us your name
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            helperText={
              <HelperText
                colorStyle={getColorStyle(formData.name, REPORT_NAME_LIMIT)}
                errorType="Your name"
                textLimit={REPORT_NAME_LIMIT}
                isError={errors.name}
                formText={formData.name}
                testId="name-error"
              />
            }
            sx={{
              mr: 4,
              mb: 2,
            }}
            inputProps={{ maxLength: REPORT_NAME_LIMIT }}
          />

          <Typography
            data-testid="description-report-issue"
            variant="body2"
            color="textPrimary"
            sx={getStyleTypography()}
          >
            Describe your issue
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            multiline
            rows={8}
            name="issue"
            value={formData.issue}
            onChange={handleChange}
            error={errors.issue}
            helperText={
              <HelperText
                colorStyle={getColorStyle(formData.issue, REPORT_DESCRIPTION_LIMIT)}
                errorType="Description"
                textLimit={REPORT_DESCRIPTION_LIMIT}
                isError={errors.issue}
                formText={formData.issue}
                testId="description-error"
              />
            }
            sx={{
              mr: 4,
              mb: 1,
            }}
            inputProps={{ maxLength: REPORT_DESCRIPTION_LIMIT }}
          />

          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              ...getStyleTypography(),
              fontSize: '0.8rem',
              textAlign: 'left',
            }}
          >
            Please do not include any sensitive information.
          </Typography>
          <Typography
            variant="body2"
            color="textPrimary"
            sx={{
              ...getStyleTypography(),
              fontSize: '0.8rem',
              textAlign: 'left',
            }}
          >
            A screenshot will help us better understand the issue. (optional)
          </Typography>
          <FilePicker onFileSelect={onFileSelect} />
        </Box>
      </div>
      <div className={`${widthClass} bottom-6 mx-[24px] flex`}>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          Send
        </Button>
      </div>
    </form>
  );
};

export default FeedbackForm;
