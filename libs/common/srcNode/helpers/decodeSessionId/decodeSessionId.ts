import type { DecodedSessionId } from '../../../src/types/DecodedSessionId';
import { StringDecoder } from 'node:string_decoder';

/**
 * Decodes an OpenTok sessionId and returns an object with its values
 * @param {String} sessionId
 * @returns {Object}
 * @throws {Error} If sessionId format is invalid
 */
const decodeSessionId = (sessionId: string): DecodedSessionId => {
  const splittedSession = (sessionId || '').split('_');
  if (splittedSession.length !== 2) {
    throw new Error('Invalid sessionId format');
  }

  const info = splittedSession[1];
  const buf = Buffer.from(info, 'base64');
  const decoder = new StringDecoder('utf8');
  const decodedSession = decoder.write(buf);
  const sessionFields = decodedSession.split('~');

  if (sessionFields.length < 4) {
    throw new Error('Invalid sessionId format');
  }

  return {
    p2p: sessionFields.includes('P'),
    autoArchive: sessionFields.includes('A'),
    version: sessionFields[0],
    partnerId: sessionFields[1],
    location: sessionFields[2],
    date: sessionFields[3],
  };
};

export default decodeSessionId;
