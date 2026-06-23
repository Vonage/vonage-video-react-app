import helmet from 'helmet';
import { RequestHandler } from 'express';

const isDevelopment = process.env.NODE_ENV !== 'production';

const helmetHandler = helmet({
  contentSecurityPolicy: isDevelopment
    ? false
    : {
        directives: {
          // Allow scripts from self and Vonage/OpenTok static assets.
          // Needed by the Vonage/OpenTok SDK to load MediaPipe transformer assets,
          // including task-vision.js and worker-side scripts loaded through importScripts(...).
          'script-src': [
            "'self'",
            // required for web assembly
            "'unsafe-eval'",
            'blob:',
            'data:',
            'https://static.opentok.com',
          ],

          // Allow connections to self and Vonage/OpenTok backend services.
          // Needed for signaling, logging, REST calls, and WebSocket traffic.
          'connect-src': [
            "'self'",
            'https://*.opentok.com',
            'https://*.tokbox.com',
            'https://*.vonage.com',
            'wss://*.opentok.com',
            'wss://*.tokbox.com',
            'wss://*.vonage.com',
            'https://static.opentok.com',
          ],

          // Allow images from self, inline/base64 images, blob URLs, and any HTTPS image source.
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],

          // Allow workers created by the SDK/app, including blob-based and inline data: workers.
          // Also allow Vonage/OpenTok static assets because MediaPipe may load worker-side
          // scripts from static.opentok.com.
          'worker-src': ["'self'", 'blob:', 'data:', 'https://static.opentok.com'],

          // Allow media resources from self, blob URLs, and HTTPS sources.
          'media-src': ["'self'", 'blob:', 'https:'],
        },
      },

  // Disabled so this page can consume external resources without requiring CORP/COEP headers.
  // This helps avoid breaking third-party fonts, CDNs, workers, and integrations.
  crossOriginEmbedderPolicy: false,

  // Allow external sites to load resources served by this app.
  // Needed when the VeraRoom web component/assets are embedded on third-party sites.
  crossOriginResourcePolicy: { policy: 'cross-origin' },

  // Prevent clickjacking by allowing this page to be framed only by the same origin.
  // This does not affect usage as a custom element via <script> + <vera-room>.
  frameguard: {
    action: 'sameorigin',
  },

  // Avoid leaking full URLs to external domains, while keeping normal same-origin referrers.
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },

  // Enable HSTS only in production.
  // Forces browsers to use HTTPS for this domain after the first successful HTTPS request.
  hsts: isDevelopment
    ? false
    : {
        maxAge: 31536000,
        includeSubDomains: true,
      },
});

const helmetMiddleware: RequestHandler = (req, res, next) => {
  return helmetHandler(req, res, next);
};

export default helmetMiddleware;
