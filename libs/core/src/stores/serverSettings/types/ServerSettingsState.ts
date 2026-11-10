export type ServerSettingsState =
  | {
      status: 'pending' | 'unavailable';
      /**
       * Server time in milliseconds.
       */
      now: number;
      clockOffset: null;
    }
  | {
      status: 'known';
      /**
       * Server time in milliseconds.
       */
      now: number;
      /**
       * Milliseconds to add to `Date.now()` to get the server time.
       */
      clockOffset: number;
    };
