import { Request, Response, Router } from 'express';

const wellKnownRouter = Router();

/**
 * Serve the static file needed for Android deep linking
 * more info: https://developer.android.com/training/app-links/verify-android-applinks#publish-json
 */
wellKnownRouter.get('/assetlinks.json', (_req: Request, res: Response) => {
  res.json([
    {
      // Grants the target permission to handle all URLs that the source can handle
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        // Package name for the Android app
        package_name: 'com.vonage.android.debug',
        // SHA-256 certificate fingerprints for the Android app
        sha256_cert_fingerprints: [
          'A4:26:72:80:DA:75:99:75:ED:D2:32:ED:0A:DC:2C:7C:27:78:6A:8C:9A:37:22:41:23:CF:9E:DB:03:78:FC:6C',
        ],
      },
    },
    {
      // Grants the target permission to handle all URLs that the source can handle
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        // Package name for the Android app
        package_name: 'com.vonage.android',
        // SHA-256 certificate fingerprints for the Android app
        sha256_cert_fingerprints: [
          'A5:77:34:82:4C:98:13:CF:88:DF:20:46:2C:B7:7E:33:C0:4C:FC:C6:A1:E4:B3:25:5F:43:49:BA:FE:B5:43:27',
        ],
      },
    },
  ]);
});

/**
 * Serve the static file needed for iOS app site association
 * more info: https://developer.apple.com/documentation/xcode/supporting-associated-domains
 */
wellKnownRouter.get('/apple-app-site-association', (_req: Request, res: Response) => {
  res.json({
    applinks: {
      details: [
        {
          appIDs: ['PR6C39UQ38.com.vonage.VERA'],
          components: [
            {
              '/': '/waiting-room/*',
              comment: 'Matches any waiting room URL',
            },
            {
              '/': '/room/*',
              comment: 'Matches any room URL',
            },
          ],
        },
      ],
    },
  });
});

export default wellKnownRouter;
