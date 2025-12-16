import { DecodedSessionId } from '@common/types';

/* eslint-disable @typescript-eslint/no-var-requires */
const { StringDecoder } = require('string_decoder');
const { Buffer } = require('buffer');
const { default: decodeJwt } = require('jwt-decode');
const { VIDEO_IDENTIFIER, ISSUER_PREFIX } = require('./portunus-identifiers');

/**
 * Decodes an OpenTok token and returns an object with its values
 * @param {String} token
 * @returns {Object}
 */
export const decodeToken = (token: string) => {
  let decoded;
  try {
    decoded = decodeJwt(token);
  } catch {
    decoded = null;
  }
  if (decoded) {
    if ((decoded.iss || '').startsWith(ISSUER_PREFIX)) {
      const portunusClaims =
        decoded?.federatedAssertions?.[VIDEO_IDENTIFIER]?.[0];
      const extraClaims = portunusClaims?.extraConfig?.[VIDEO_IDENTIFIER];
      Object.assign(decoded, portunusClaims);
      Object.assign(decoded, extraClaims);
      decoded.application_id = decoded.applicationId;
    }
    return decoded;
  }

  const strippedToken = (token || '').substring(4);
  const decodedString = Buffer.from(strippedToken, 'base64')
    .toString()
    .replace(':', '&');
  return decodedString
    .split('&')
    .reduce((obj: Record<string, string>, param: string) => {
      const [key, value] = param.split('=');
      return {
        ...obj,
        [key]: value,
      };
    }, {});
};

/**
 * Decodes an OpenTok sessionId and returns an object with its values
 * @param {String} sessionId
 * @returns {Object}
 */
export const decodeSessionId = (sessionId: string): DecodedSessionId | null => {
  const splittedSession = (sessionId || '').split('_');
  if (splittedSession.length !== 2) {
    return null;
  }
  const info = sessionId.split('_')[1];
  const buf = Buffer.from(info, 'base64');
  const decoder = new StringDecoder('utf8');
  const decodedSession = decoder.write(buf);
  const sessionFields = decodedSession.split('~');
  if (sessionFields.length < 4) {
    return null;
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

export const getPartnerId = (sessionId: string) =>
  decodeSessionId(sessionId)?.partnerId;

/**
 * getOTVersionNumber - Returns the major and minor version of an OpenTok SDK
 * @param {String} otVersion
 * @returns {Object}
 */
export const getOTVersionNumber = (otVersion: string) => {
  if (!otVersion) {
    return { major: null, minor: null };
  }
  const [major, minor] = otVersion.split('.').map((_) => parseInt(_, 10));
  return { major, minor };
};

/**
 * isNexmoProject - Return if a given projectId is an applicationId
 * @param {String} projectId
 * @returns {Boolean}
 */
export const isNexmoProject = (projectId: string) =>
  !/^[0-9]+$/i.test(projectId);

export default {
  decodeToken,
  decodeSessionId,
  getOTVersionNumber,
  isNexmoProject,
  getPartnerId,
};
