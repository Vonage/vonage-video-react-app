import { Tooltip } from '@mui/material';
import { ReactElement, useRef } from 'react';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ToolbarButton from '../ToolbarButton';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type ReportIssueButtonProps = {
  handleClick: () => void;
  isOpen: boolean;
  handleClickAway?: () => void;
};

/**
 * ReportIssueButton Component
 *
 * Displays a clickable button to open/close the ReportIssue panel.
 * @param {ReportIssueButtonProps} props - The props for the component.
 *  @property {() => void} handleClick - click handler, e.g open report issue form
 *  @property {boolean} isOpen - whether the report issue form should be shown
 *  @property {() => void} handleClickAway - (optional) click handler that closes the overflow menu in small view port devices.
 * @returns {ReactElement} The ReportIssueButton component.
 */
const ReportIssueButton = ({
  handleClick,
  isOpen,
  handleClickAway,
}: ReportIssueButtonProps): ReactElement => {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const isSmallViewport = useIsSmallViewport();
  const handleClose = () => {
    handleClick();
    if (isSmallViewport && handleClickAway) {
      handleClickAway();
    }
  };
  return (
    <div className="pr-3">
      <Tooltip title="Report issue" aria-label="open report issue menu">
        <ToolbarButton
          data-testid="report-issue-button"
          sx={{
            marginTop: '0px',
            marginRight: '0px',
          }}
          onClick={handleClose}
          icon={<FeedbackIcon style={{ color: `${!isOpen ? 'white' : 'rgb(138, 180, 248)'}` }} />}
          ref={anchorRef}
          isSmallViewPort={isSmallViewport}
        />
      </Tooltip>
    </div>
  );
};

export default ReportIssueButton;
