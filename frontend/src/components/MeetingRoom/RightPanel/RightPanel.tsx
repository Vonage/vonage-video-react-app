import { ReactElement } from 'react';
import ParticipantList from '../ParticipantList/ParticipantList';
import Chat from '../Chat';
import ReportIssue from '../ReportIssue';
import type { RightPanelActiveTab } from '../../../hooks/useRightPanel';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import BackgroundEffectsLayout from '../../BackgroundEffects/BackgroundEffectsLayout';
import Box from '@ui/Box';
import useTheme from '@ui/theme';

export type RightPanelProps = {
  handleClose: () => void;
  activeTab: RightPanelActiveTab;
};

/**
 * RightPanel Component
 * Renders a tab panel that enters from off screen on the right of the window.
 * The panel displays participant list, chat tab, report issue and background effects.
 * @param {RightPanelProps} props - props for the component
 *   @property {RightPanelActiveTab} activeTab - string indicating which tab to display, or 'closed' if closed
 *   @property {Function} handleClose - click handler to close the panel
 * @returns {ReactElement} RightPanel Component
 */
const RightPanel = ({ activeTab, handleClose }: RightPanelProps): ReactElement => {
  const isSmallViewport = useIsSmallViewport();
  const theme = useTheme();

  return (
    <Box
      data-testid="right-panel"
      sx={{
        position: 'absolute',
        top: 0,
        right: activeTab === 'closed' ? '-380px' : 0,
        display: activeTab === 'closed' ? 'none' : 'block',
        overflow: 'hidden',
        bgcolor: theme.colors.surface,
        transition: 'right 0.3s',
        borderRadius: 2,
        width: isSmallViewport ? '100dvw' : '360px',
        height: isSmallViewport ? 'calc(100dvh - 80px)' : 'calc(100dvh - 96px)',
        mr: isSmallViewport ? 0 : 2,
        mt: isSmallViewport ? 0 : 2,
      }}
    >
      <ParticipantList handleClose={handleClose} isOpen={activeTab === 'participant-list'} />
      <BackgroundEffectsLayout
        mode="meeting"
        handleClose={handleClose}
        isOpen={activeTab === 'background-effects'}
      />
      <Chat handleClose={handleClose} isOpen={activeTab === 'chat'} />
      <ReportIssue handleClose={handleClose} isOpen={activeTab === 'issues'} />
    </Box>
  );
};

export default RightPanel;
