import { ReactElement } from 'react';
import ParticipantList from '../ParticipantList/ParticipantList';
import Chat from '../Chat';
import ReportIssue from '../ReportIssue';
import type { RightPanelActiveTab } from '../../../hooks/useRightPanel';
import BackgroundEffectsLayout from '../../BackgroundEffects/BackgroundEffectsLayout';
import Box from '@mui/material/Box';
import type { BoxProps } from '@mui/material/Box';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';

export type RightPanelProps = {
  handleClose: () => void;
  activeTab: RightPanelActiveTab;
} & BoxProps;

/**
 * RightPanel Component
 * Renders a tab panel that enters from off screen on the right of the window.
 * The panel displays participant list, chat tab, report issue and background effects.
 * @param {RightPanelProps} props - props for the component
 *   @property {RightPanelActiveTab} activeTab - string indicating which tab to display, or 'closed' if closed
 *   @property {Function} handleClose - click handler to close the panel
 * @returns {ReactElement} RightPanel Component
 */
const RightPanel = ({
  handleClose,
  activeTab,
  className,
  ...boxProps
}: RightPanelProps): ReactElement => {
  return (
    <Box
      data-testid="right-panel"
      className={twMerge(
        classNames([
          'w-dvw vera-desktop:w-[350px]',
          'h-[calc(100dvh-80px)] vera-desktop:h-[calc(100dvh-96px)]',
          'mr-0 vera-desktop:mr-4 mt-0 vera-desktop:mt-4',
          'bg-vera-surface',
          className,
        ])
      )}
      sx={{
        position: 'absolute',
        top: 0,
        right: activeTab === 'closed' ? '-380px' : 0,
        display: activeTab === 'closed' ? 'none' : 'block',
        overflow: 'hidden',
        transition: 'right 0.3s',
        borderRadius: 2,
      }}
      {...boxProps}
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
