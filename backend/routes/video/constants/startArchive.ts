import { HandlersConfig } from '@api-lib';
import { LayoutType, Resolution } from '@vonage/video';

const startArchive: HandlersConfig['startArchive'] = {
  addDefaults: ({ sessionKey, archiveOptions }) => ({
    sessionKey,
    archiveOptions: {
      resolution: Resolution.FHD_LANDSCAPE,
      layout: {
        // In multiparty archives, we use the 'bestFit' layout to scale based on the number of streams. For screen-sharing archives,
        // we select 'horizontalPresentation' so the screenshare stream is displayed prominently along with other streams.
        // See: https://developer.vonage.com/en/video/guides/archive-broadcast-layout#layout-types-for-screen-sharing
        type: LayoutType.BEST_FIT,
        screenshareType: 'horizontalPresentation',
      },
      ...archiveOptions,
    },
  }),
};

export default startArchive;
