import jwt from 'jsonwebtoken';

const RTCSTATS_TOKEN_EXPIRY = '10m';

/**
 * Builds the signed rtcstats-server WebSocket URL for a session (https://rtcstats.com).
 *
 * rtcstats is optional: this returns null unless both `RTCSTATS_ENDPOINT` and
 * `RTCSTATS_JWT_SECRET` are set. The secret must match the rtcstats-server one, otherwise the
 * server closes the socket with code 1008 and no dump is written.
 * @param {object} session - The decoded session the dump belongs to.
 * @param {string} session.sessionId - The Vonage session id, stored as the rtcstats session.
 * @param {string | null} [session.roomName] - The room name, stored as the rtcstats conference.
 * @returns {string | null} The URL to pass to `trace.connect`, or null when rtcstats is off.
 */
const createRtcStatsUrl = ({
  sessionId,
  roomName,
}: {
  sessionId: string;
  roomName?: string | null;
}): string | null => {
  const endpoint = process.env.RTCSTATS_ENDPOINT;
  const secret = process.env.RTCSTATS_JWT_SECRET;

  if (!endpoint || !secret) return null;

  const token = jwt.sign({ rtcStats: { conference: roomName ?? '', session: sessionId } }, secret, {
    expiresIn: RTCSTATS_TOKEN_EXPIRY,
  });

  const url = new URL(endpoint);
  url.searchParams.set('rtcstats-token', token);

  return url.toString();
};

export default createRtcStatsUrl;
