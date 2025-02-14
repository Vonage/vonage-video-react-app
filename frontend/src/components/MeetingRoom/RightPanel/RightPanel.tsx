import { ReactElement } from 'react';
import ParticipantList from '../ParticipantList/ParticipantList';
import Chat from '../Chat';
import ReportIssue from '../ReportIssue';
import type { RightPanelActiveTab } from '../../../hooks/useRightPanel';

const height = '@apply h-[calc(100vh_-_96px)]';

export type RightPanelProps = {
  handleClose: () => void;
  activeTab: RightPanelActiveTab;
};

/**
 * RightPanel Component
 * Renders a tab panel that enters from off screen on the right of the window.
 * The panel displays participant list or chat tab.
 * @param {RightPanelProps} props - props for the component
 *   @property {RightPanelActiveTab} activeTab - string indicating which tab to display, or 'closed' if closed
 *   @property {() => void} handleClose - click handler to close the panel
 * @returns {ReactElement} RightPanel Component
 */
const RightPanel = ({ activeTab, handleClose }: RightPanelProps): ReactElement => {
  return (
    <div
      data-testid="right-panel"
      className={`${height} absolute top-0 mr-4 mt-4 w-[360px] overflow-hidden rounded bg-white transition-[right] ${activeTab === 'closed' ? 'right-[-380px] hidden' : 'right-0'}`}
    >
      <div>
        <ParticipantList handleClose={handleClose} isOpen={activeTab === 'participant-list'} />
        <Chat handleClose={handleClose} isOpen={activeTab === 'chat'} />
        <ReportIssue handleClose={handleClose} isOpen={activeTab === 'issues'} />
      </div>
    </div>
  );
};

export default RightPanel;
