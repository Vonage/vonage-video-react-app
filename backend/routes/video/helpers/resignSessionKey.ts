import jwt from 'jsonwebtoken';
import type { VideoClient } from '../video';

function resignSessionKey({
  claims,
  videoClient,
}: {
  claims: Record<string, unknown>;
  videoClient: VideoClient;
}): string {
  const { secret, algorithm } = videoClient._sessionSigning;

  return jwt.sign(claims, secret, { algorithm });
}

export default resignSessionKey;
