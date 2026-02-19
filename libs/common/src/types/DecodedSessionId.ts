export type DecodedSessionId = {
  /** Indicates if the session is peer-to-peer */
  p2p: boolean;

  /** Indicates if the session is set to auto-archive */
  autoArchive: boolean;

  /** The version of the session */
  version: string;

  /** The partner ID associated with the session */
  partnerId: string;

  /** The location hint (IP address or region) used when the session was created for media routing */
  location: string;

  /** Creation date */
  date: string;
};

export default DecodedSessionId;
