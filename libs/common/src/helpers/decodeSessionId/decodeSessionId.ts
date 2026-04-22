import type { DecodedSessionId } from '../../types/DecodedSessionId';

const decodeSessionId = ({ sessionId }: { sessionId: string }): DecodedSessionId => {
  const [, encoded] = sessionId.split('_');

  if (!encoded) {
    throw new Error('Invalid sessionId format');
  }

  const info = encoded.replace(/-/g, '+');

  const binary = atob(info);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));

  const decodedSession = new TextDecoder().decode(bytes);
  const sessionFields = decodedSession.split('~');

  if (sessionFields.length < 4) {
    throw new Error('Invalid sessionId format');
  }

  return {
    p2p: sessionFields.includes('P'),
    autoArchive: sessionFields.includes('A'),
    version: sessionFields[0],
    partnerId: sessionFields[1],
    applicationId: sessionFields[1], // verify this
    location: sessionFields[2],
    date: sessionFields[3],
  };
};

export default decodeSessionId;
