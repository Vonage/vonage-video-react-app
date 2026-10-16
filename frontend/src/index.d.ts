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
};

// DocumentPictureInPicture type augmentation lives in
// libs/common/src/types/DocumentPictureInPicture.d.ts and is included
// via the @common path mapping (see tsconfig include for type files).
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
