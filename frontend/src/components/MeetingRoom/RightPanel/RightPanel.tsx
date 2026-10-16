import { lazy, ReactElement, useState } from 'react';
import ParticipantList from '../ParticipantList/ParticipantList';
import Chat from '../Chat';
import type { RightPanelActiveTab } from '../../../hooks/useRightPanel';
import BackgroundEffectsLayout from '../../BackgroundEffects/BackgroundEffectsLayout';
import Box from '@mui/material/Box';
import type { BoxProps } from '@mui/material/Box';
import LazyLoadBoundary from '@components/LazyLoadBoundary';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';

const ReportIssue = lazy(() => import('../ReportIssue'));

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
  // Load the Report Issue chunk on first open, then keep it mounted so a half-filled form survives tab switches
  const [hasOpenedIssues, setHasOpenedIssues] = useState(activeTab === 'issues');
  if (activeTab === 'issues' && !hasOpenedIssues) {
    setHasOpenedIssues(true);
  }

  const reportIssuePanel = hasOpenedIssues && (
    <LazyLoadBoundary>
      <ReportIssue handleClose={handleClose} isOpen={activeTab === 'issues'} />
    </LazyLoadBoundary>
  );

  return (
    <Box
      data-testid="right-panel"
      className={twMerge(
        classNames([
          'absolute top-0 overflow-hidden transition-[right] duration-300 rounded-lg',
          'w-dvw vera-desktop:w-87.5',
          'h-[calc(100dvh-80px)] vera-desktop:h-[calc(100dvh-96px)]',
          'mr-0 vera-desktop:mr-4 mt-0 vera-desktop:mt-4',
          'bg-vera-surface',
          activeTab === 'closed' ? 'right-95 hidden' : 'right-0 block',
          className,
        ])
      )}
      {...boxProps}
    >
      <ParticipantList handleClose={handleClose} isOpen={activeTab === 'participant-list'} />
      <BackgroundEffectsLayout
        mode="meeting"
        handleClose={handleClose}
        isOpen={activeTab === 'background-effects'}
      />
      <Chat handleClose={handleClose} isOpen={activeTab === 'chat'} />
      {reportIssuePanel}
    </Box>
  );
};

export default RightPanel;
