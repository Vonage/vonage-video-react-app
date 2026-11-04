const endingSoonSeconds = 5 * 60;

/**
 * Whether the meeting is in its last five minutes.
 */
function isMeetingEndingSoon(secondsLeft: number): boolean {
  return secondsLeft <= endingSoonSeconds;
}

export default isMeetingEndingSoon;
