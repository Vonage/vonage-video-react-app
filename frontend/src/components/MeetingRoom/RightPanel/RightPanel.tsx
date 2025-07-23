import { ReactElement } from 'react';
import ParticipantList from '../ParticipantList/ParticipantList';
import Chat from '../Chat';
import ReportIssue from '../ReportIssue';
import type { RightPanelActiveTab } from '../../../hooks/useRightPanel';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import BackgroundEffectsLayout from '../BackgroundEffectsLayout/BackgroundEffectsLayout';

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
 *   @property {Function} handleClose - click handler to close the panel
 * @returns {ReactElement} RightPanel Component
 */
const RightPanel = ({ activeTab, handleClose }: RightPanelProps): ReactElement => {
  const isSmallViewport = useIsSmallViewport();
  const width = isSmallViewport ? 'w-dvw' : 'w-[360px]';
  const margins = isSmallViewport ? 'm-0' : 'mr-4 mt-4';
  const height = isSmallViewport
    ? '@apply h-[calc(100dvh_-_80px)]'
    : '@apply h-[calc(100dvh_-_96px)]';
  const className = `${height} absolute top-0 ${margins} ${width} overflow-hidden rounded bg-white transition-[right] ${activeTab === 'closed' ? 'right-[-380px] hidden' : 'right-0'}`;

  return (
    <div data-testid="right-panel" className={className}>
      <ParticipantList handleClose={handleClose} isOpen={activeTab === 'participant-list'} />
      <BackgroundEffectsLayout
        handleClose={handleClose}
        isOpen={activeTab === 'background-effects'}
      />
      <Chat handleClose={handleClose} isOpen={activeTab === 'chat'} />
      <ReportIssue handleClose={handleClose} isOpen={activeTab === 'issues'} />
    </div>
  );
};

export default RightPanel;
