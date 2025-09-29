import { ChangeEvent, ReactElement, useState, FormEvent } from 'react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import RightPanelTitle from '../RightPanel/RightPanelTitle';
import useCollectBrowserInformation from '../../../hooks/useCollectBrowserInformation';
import FormSubmitted from './FormSubmitted';
import FeedbackForm from './FeedbackForm';
import reportIssue from '../../../api/reportFeedback';
import {
  REPORT_TITLE_LIMIT,
  REPORT_NAME_LIMIT,
  REPORT_DESCRIPTION_LIMIT,
} from '../../../utils/constants';
import { ErrorFormType } from './FeedbackForm/FeedbackForm';

export type ReportIssueProps = {
  handleClose: () => void;
  isOpen: boolean;
};

type FormField = 'title' | 'name' | 'issue';

export type FormType = {
  title: string;
  name: string;
  issue: string;
  attachment: string;
};

type ResponseType = {
  message: string;
  ticketUrl: string;
};

/**
 * ReportIssue Component
 *
 * This component allows users to provide feedback about any potential issue they encountered
 * @param {ReportIssueProps} props - the props for the component.
 *  @property {() => void} handleClose - the function handling the closing of the component.
 *  @property {boolean} isOpen - indicates whether the report issue component is open or closed.
 * @returns {ReactElement} The report issue component.
 */
const ReportIssue = ({ handleClose, isOpen }: ReportIssueProps): ReactElement | false => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormType>({
    title: '',
    name: '',
    issue: '',
    attachment: '',
  });

  const [ticketResponse, setTicketResponse] = useState<ResponseType>({
    message: '',
    ticketUrl: '',
  });
  const [isFormVisible, setIsFormVisible] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);

  const [errors, setErrors] = useState<ErrorFormType>({
    title: false,
    name: false,
    issue: false,
  });

  const browserInfo = useCollectBrowserInformation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const formFields = name as FormField;

    const newErrors: ErrorFormType = {
      title: value.length >= REPORT_TITLE_LIMIT,
      name: value.length >= REPORT_NAME_LIMIT,
      issue: value.length >= REPORT_DESCRIPTION_LIMIT,
    };

    setFormData((prevFormData) => ({
      ...prevFormData,
      [formFields]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value.length === 0 || newErrors[formFields],
    }));
  };

  const handleFileSelect = (attachment: string) => {
    // we have to remove the data:image/png;base64, part
    // because while it provides information about the file type
    // it is not part of the actual binary content of the image
    const data = attachment.replace(/^data:image\/\w+;base64,/, '');
    setFormData((prev) => ({ ...prev, attachment: data }));
  };

  const handleCloseFormSubmitted = () => {
    setFormData({
      title: '',
      name: '',
      issue: '',
      attachment: '',
    });
    // this is needed to make the form available the next time it is opened
    setIsFormVisible(true);
    handleClose();
  };

  const validateForm = () => {
    const newErrors = {
      title: formData.title === '',
      name: formData.name === '',
      issue: formData.issue === '',
    };
    setErrors(newErrors);
    return !newErrors.issue && !newErrors.title && !newErrors.name;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validateForm()) {
      setLoading(true);
      // Add-on the additional information to the issue field
      const updatedIssueField = `${formData.issue}\n\nAdditional information:\n${JSON.stringify(browserInfo, null, 2)}`;

      const submissionData = {
        ...formData,
        issue: updatedIssueField,
      };
      try {
        // make the axios request
        const response = await reportIssue(submissionData);
        setTicketResponse(response.data.feedbackData);
        setIsFormVisible(false);
        setLoading(false);
      } catch (error: unknown) {
        const axiosError = error as AxiosError;
        const errorResponse = {
          message: axiosError.message,
          ticketUrl: '',
        };
        setTicketResponse(errorResponse);
        setIsFormVisible(false);
        setLoading(false);
      }
    }
  };

  return (
    isOpen && (
      <>
        <RightPanelTitle title={t('feedbackForm.title')} handleClose={handleCloseFormSubmitted} />
        {isFormVisible ? (
          <FeedbackForm
            handleSubmit={handleSubmit}
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            loading={loading}
            onFileSelect={handleFileSelect}
          />
        ) : (
          <FormSubmitted
            handleCloseFormSubmitted={handleCloseFormSubmitted}
            ticketResponse={ticketResponse}
          />
        )}
      </>
    )
  );
};

export default ReportIssue;
