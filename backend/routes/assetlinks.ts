import { Request, Response, Router } from 'express';

const assetLinksRouter = Router();

/**
 * tl:dr: Serve the static file needed for mobile deep linking
 * more info: https://developer.android.com/training/app-links/verify-android-applinks#publish-json
 */
assetLinksRouter.get('/assetlinks.json', (_req: Request, res: Response) => {
  res.json([
    {
      // Grants the target permission to handle all URLs that the source can handle
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        // Package name for the Android app
        package_name: 'com.vonage.android',
        // SHA-256 certificate fingerprints for the Android app
        sha256_cert_fingerprints: [
          'A4:26:72:80:DA:75:99:75:ED:D2:32:ED:0A:DC:2C:7C:27:78:6A:8C:9A:37:22:41:23:CF:9E:DB:03:78:FC:6C',
        ],
      },
    },
  ]);
});

export default assetLinksRouter;
