import isReportIssueEnabled from '@utils/isReportIssueEnabled';
import isMiniModeSupported from '@Context/MiniMode/isMiniModeSupported';
import { env } from '../../../../env';
import shouldDisplayScreenShareButton from '../../../ScreenSharingButton/shouldDisplayScreenShareButton';

export type ToolbarButtonVisibility = {
  screenShare: boolean;
  miniMode: boolean;
  emojis: boolean;
  captions: boolean;
  archiving: boolean;
  postCallTranscription: boolean;
  advancedSettings: boolean;
  reportIssue: boolean;
  participantList: boolean;
  chat: boolean;
};

/**
 * Resolves which feature buttons are displayed in the toolbar and its overflow menu.
 * @returns {ToolbarButtonVisibility} - whether each toolbar feature button is displayed
 */
const getToolbarButtonVisibility = (): ToolbarButtonVisibility => ({
  screenShare: shouldDisplayScreenShareButton(),
  miniMode: isMiniModeSupported(),
  emojis: env.ALLOW_EMOJIS,
  captions: env.ALLOW_CAPTIONS,
  archiving: env.ALLOW_ARCHIVING,
  postCallTranscription: env.ALLOW_POST_CALL_TRANSCRIPTION,
  advancedSettings: env.MEETING_ROOM_ALLOW_ADVANCED_SETTINGS,
  reportIssue: isReportIssueEnabled(),
  participantList: env.SHOW_PARTICIPANT_LIST,
  chat: env.ALLOW_CHAT,
});

export default getToolbarButtonVisibility;
