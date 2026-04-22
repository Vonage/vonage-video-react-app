export type DecodedSessionId = {
  /** Indicates if the session is peer-to-peer */
  p2p: boolean;

  /** Indicates if the session is set to auto-archive */
  autoArchive: boolean;

  /** The version of the session */
  version: string;

  /**
   * @deprecated Use applicationId instead. This value is the same as applicationId */
  partnerId: string;

  /*
   * The application ID associated with the session. This is typically the same as the partner ID, but can be different in some cases.
   */
  applicationId: string;

  /** The location hint (IP address or region) used when the session was created for media routing */
  location: string;

  /** Creation date */
  date: string;
};

export default DecodedSessionId;
