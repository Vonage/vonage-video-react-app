import { Tooltip } from '@mui/material';
import { ReactElement, useRef } from 'react';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { blue } from '@mui/material/colors';
import { useTranslation } from 'react-i18next';
import ToolbarButton from '../ToolbarButton';

export type ReportIssueButtonProps = {
  handleClick: () => void;
  isOpen: boolean;
  isOverflowButton?: boolean;
};

/**
 * ReportIssueButton Component
 *
 * Displays a clickable button to open/close the ReportIssue panel.
 * @param {ReportIssueButtonProps} props - The props for the component.
 *  @property {Function} handleClick - click handler to open the Report Issue panel
 *  @property {boolean} isOpen - whether the Report Issue panel is open
 *  @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 * @returns {ReactElement} The ReportIssueButton component.
 */
const ReportIssueButton = ({
  handleClick,
  isOpen,
  isOverflowButton = false,
}: ReportIssueButtonProps): ReactElement => {
  const { t } = useTranslation();
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <Tooltip
      title={isOpen ? t('feedbackForm.close') : t('feedbackForm.open')}
      aria-label={t('feedbackForm.ariaLabel')}
    >
      <ToolbarButton
        data-testid="report-issue-button"
        sx={{
          marginTop: '0px',
          marginRight: '12px',
        }}
        onClick={handleClick}
        icon={<FeedbackIcon sx={{ color: isOpen ? blue.A100 : 'white' }} />}
        ref={anchorRef}
        isOverflowButton={isOverflowButton}
      />
    </Tooltip>
  );
};

export default ReportIssueButton;
