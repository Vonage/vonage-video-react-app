/** Error shape in serialized payload (avoids sending Error instances over the wire). */
export type SerializedError = {
  message: string;
  name: string;
  stack?: string;
};

/** Allowed payload value types after serialization. */
export type ClientLogPayloadValue = string | number | boolean | null | SerializedError;

/**
 * Frontend → Backend logging payload contract.
 * Do not add required fields or change field types without coordinating FE and BE.
 */
export type ClientLogEvent = {
  /** Event name: CallStarted, CallEnded, Error, CallConnectionLost, etc. */
  action: string;
  /** Success | error.name | disconnect reason */
  variation?: string;
  /** Event-specific data */
  payload?: Record<string, ClientLogPayloadValue>;
  sessionId: string;
  connectionId: string;
  /** Date.now() at client */
  clientSystemTime: number;
  /** navigator.userAgent */
  userAgent: string;
  level: 'info' | 'error';
  /**
   * Correlation id: same for all logs from this page load.
   * Enables grouping one user's call in Kibana.
   */
  guid: string;
  clientVersion?: string;
  sdkId?: string;
  logVersion?: string;
  /** window.location.origin (Gollum source) */
  source: string;
  name?: string;
  componentId?: string;
  /** apiKey / applicationId from frontend extra */
  partnerId: string;
};
