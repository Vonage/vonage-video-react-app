import { HandlersConfig } from '@api-lib';

const enableCaptions: HandlersConfig['enableCaptions'] = {
  addDefaults: ({ sessionKey, captionOptions }) => ({
    sessionKey,
    captionOptions: {
      // The full list of supported languages can be found here: https://developer.vonage.com/en/video/guides/live-caption#supported-languages
      languageCode: 'en-US',
      // The maximum duration of the captions in seconds. The default is 14,400 seconds (4 hours).
      maxDuration: 1800,
      // Enabling partial captions allows for more frequent updates to the captions.
      // This is useful for real-time applications where the captions need to be updated frequently.
      // However, it may also increase the number of inaccuracies in the captions.
      partialCaptions: 'true',
      ...captionOptions,
    },
  }),
};

export default enableCaptions;
