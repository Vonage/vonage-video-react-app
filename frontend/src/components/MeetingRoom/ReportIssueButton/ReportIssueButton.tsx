import { Tooltip } from '@mui/material';
import { ReactElement, useRef } from 'react';
import FeedbackIcon from '@mui/icons-material/Feedback';
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
      <Tooltip title="Report issue" aria-label="open report issue menu">
        <ToolbarButton
          data-testid="report-issue-button"
          sx={{
            marginTop: '0px',
            marginRight: '0px',
            width: isSmallViewport ? '42px' : undefined,
            height: isSmallViewport ? '42px' : undefined,
          }}
          onClick={handleClick}
          icon={<FeedbackIcon style={{ color: `${!isOpen ? 'white' : 'rgb(138, 180, 248)'}` }} />}
          ref={anchorRef}
        />
      </Tooltip>
    </div>
  );
};

export default ReportIssueButton;
