import { useCallback, useState } from 'react';

export type RightPanelActiveTab = 'chat' | 'participant-list' | 'closed' | 'issues';

export type RightPanelState = {
  activeTab: RightPanelActiveTab;
  unreadCount: number;
};

export type UseRightPanel = {
  closeRightPanel: () => void;
  incrementUnreadCount: () => void;
  rightPanelState: RightPanelState;
  toggleChat: () => void;
  toggleParticipantList: () => void;
  toggleReportIssue: () => void;
};

/**
 * React hook containing all the state and update methods for the RightPanel component
 * @returns {UseRightPanel} - collection of state and update methods
 */
const useRightPanel = (): UseRightPanel => {
  const [rightPanelState, setRightPanelState] = useState<RightPanelState>({
    activeTab: 'closed',
    unreadCount: 0,
  });

  /**
   * toggleChat - util to toggle participant list visibility,
   */
  const toggleParticipantList = useCallback(() => {
    setRightPanelState((prev) => {
      if (prev.activeTab === 'participant-list') {
        return { ...prev, activeTab: 'closed' };
      }
      return { ...prev, activeTab: 'participant-list' };
    });
  }, []);

  /**
   * closeRightPanel - util to close right panel.
   */
  const closeRightPanel = useCallback(() => {
    setRightPanelState((prev) => ({
      ...prev,
      activeTab: 'closed',
    }));
  }, []);

  /**
   * toggleChat - util to toggle chat visibility,
   * it also resets unread message counter,
   */
  const toggleChat = useCallback(() => {
    setRightPanelState((prev) => {
      if (prev.activeTab === 'chat') {
        return {
          activeTab: 'closed',
          unreadCount: 0,
        };
      }
      return { unreadCount: 0, activeTab: 'chat' };
    });
  }, []);

  const toggleReportIssue = useCallback(() => {
    setRightPanelState((prev) => {
      if (prev.activeTab === 'issues') {
        return {
          ...prev,
          activeTab: 'closed',
        };
      }
      return { ...prev, activeTab: 'issues' };
    });
  }, []);

  /**
   * incrementUnreadCount - util to increment unread message badge by one,
   * it does not increment counter if chat is open.
   */
  const incrementUnreadCount = useCallback(() => {
    setRightPanelState((prev) => {
      if (prev.activeTab !== 'chat') {
        return {
          ...prev,
          unreadCount: prev.unreadCount + 1,
        };
      }
      return prev;
    });
  }, []);

  return {
    closeRightPanel,
    rightPanelState,
    toggleChat,
    toggleParticipantList,
    incrementUnreadCount,
    toggleReportIssue,
  };
};

export default useRightPanel;
