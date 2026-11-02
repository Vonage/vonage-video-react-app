/**
 * Attributes available on the vera-room custom element.
 * These map to the bridge attributes used for configuration.
 */
type VeraRoomAttributes = {
  /** The entry point identifier for logging and session source tracking */
  'entry-point'?: string;

  /** Session identifier to join an existing session directly */
  'session-identifier'?: string;

  /**
   * BCP-47 language tag for the UI locale (e.g. 'en', 'es', 'it').
   * Falls back to the browser's detected language when not provided.
   */
  language?: string;

  /**
   * Fetch credentials mode for API calls: 'include' (default), 'same-origin' or 'omit'.
   * Ignored when a `videoClient` is set on the element.
   */
  credentials?: 'include' | 'same-origin' | 'omit';
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      /**
       * Vera embeddable web component for video conferencing.
       */
      'vera-room': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & VeraRoomAttributes,
        HTMLElement
      >;
    }
  }
}

export {};
