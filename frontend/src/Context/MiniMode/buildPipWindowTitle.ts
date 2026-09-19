/**
 * Builds the title shown in the Picture-in-Picture window title bar.
 *
 * Appends a recording indicator (⏺) when the meeting is being recorded so
 * the user can always see whether recording is active from the mini window.
 *
 * @param roomName - The meeting room name (may be empty)
 * @param isRecording - Whether recording is active
 * @returns The formatted window title
 */
export function buildPipWindowTitle(roomName: string, isRecording: boolean): string {
  const baseTitle = roomName || 'Mini Mode';
  return isRecording ? `${baseTitle} ⏺` : baseTitle;
}

export default buildPipWindowTitle;
