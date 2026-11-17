const getRoomShareUrl = ({
  origin,
  sessionKey,
}: {
  origin: string;
  sessionKey: string | null;
}): string => `${origin}/waiting-room/${sessionKey}`;

export default getRoomShareUrl;
