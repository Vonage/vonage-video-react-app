import { Tooltip } from '@mui/material';
import { ReactElement, useRef } from 'react';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { blue } from '@mui/material/colors';
import ToolbarButton from '../ToolbarButton';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type ReportIssueButtonProps = {
  handleClick: () => void;
  isOpen: boolean;
};

/**
 * ReportIssueButton Component
 *
 * Displays a clickable button to open/close the ReportIssue panel.
 * @param {ReportIssueButtonProps} props - The props for the component.
 * @returns {ReactElement} The ReportIssueButton component.
 */
const ReportIssueButton = ({ handleClick, isOpen }: ReportIssueButtonProps): ReactElement => {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const isSmallViewport = useIsSmallViewport();
  return (
    <div className="pr-3">
      <Tooltip
        title={isOpen ? 'Close report issue form' : 'Open report issue form'}
        aria-label="toggle report issue form"
      >
        <ToolbarButton
          data-testid="report-issue-button"
          sx={{
            marginTop: '0px',
            marginRight: '0px',
          }}
          onClick={handleClick}
          icon={<FeedbackIcon sx={{ color: isOpen ? blue.A100 : 'white' }} />}
          ref={anchorRef}
          isSmallViewPort={isSmallViewport}
        />
      </Tooltip>
    </div>
  );
};

export default ReportIssueButton;
