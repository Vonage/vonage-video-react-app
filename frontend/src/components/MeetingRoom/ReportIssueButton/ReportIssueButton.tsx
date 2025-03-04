import { Tooltip } from '@mui/material';
import { ReactElement, useRef } from 'react';
import FeedbackIcon from '@mui/icons-material/Feedback';
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
 *  @property {boolean} isOverflowButton - whether the button is in the ToolbarOverflowMenu
 * @returns {ReactElement} The ReportIssueButton component.
 */
const ReportIssueButton = ({
  handleClick,
  isOpen,
  isOverflowButton = false,
}: ReportIssueButtonProps): ReactElement => {
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="pr-3">
      <Tooltip title="Report issue" aria-label="open report issue menu">
        <ToolbarButton
          data-testid="report-issue-button"
          sx={{
            marginTop: '0px',
            marginRight: '0px',
          }}
          onClick={handleClick}
          icon={<FeedbackIcon style={{ color: `${!isOpen ? 'white' : 'rgb(138, 180, 248)'}` }} />}
          ref={anchorRef}
          isOverflowButton={isOverflowButton}
        />
      </Tooltip>
    </div>
  );
};

export default ReportIssueButton;
