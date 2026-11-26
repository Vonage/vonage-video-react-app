// needs to go on top since it also loads environment variables from .env file
import loadConfig from './helpers/config';

import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import { Server } from 'http';
import router from './routes';
import videoRouter, { makeVideoClient$ } from './routes/video';
import hasVerifiedSessionKey from './routes/video/helpers/hasVerifiedSessionKey';
import { fileURLToPath } from 'url';
import {
  anonymousRateLimitMiddleware,
  authMiddleware,
  corsMiddleware,
  errorHandler,
  helmetMiddleware,
  rateLimitMiddleware,
} from './middleware';
import logAuthFeatures from './middleware/authMiddleware/helpers/logAuthFeatures';
import readCallbackPath from './routes/auth/helpers/readCallbackPath';
import { SIGN_IN_PATH, SIGN_OUT_PATH } from './routes/auth/constants';

/**
 * The runtimeDirectory works different on CJS and ESM
 * We are embedding __IS_CJS__ variable during build time enforce the correct behavior
 */
let runtimeDir: string = '';
if (process.env.__IS_CJS__) {
  runtimeDir = __dirname;
} else {
  runtimeDir = path.dirname(fileURLToPath(import.meta.url));
}

const defaultPort = Number(process.env.VCR_PORT ?? 3345);

const PUBLIC_BUILD_FOLDERS = ['assets', 'images', 'background'];
const MEETING_LINK_PATHS = ['/waiting-room/:roomIdentifier', '/room/:roomIdentifier'];
const ANONYMOUS_REPORT_PATHS = ['/client-logs', '/feedback/report'];

const authCallbackPaths = (() => {
  const authConfig = loadConfig();

  return authConfig.authEnabled ? [readCallbackPath(authConfig)] : [];
})();

const app: Express = express();

app.use(helmetMiddleware);
app.use(rateLimitMiddleware);

// Parse the unauthenticated /feedback endpoint with a small limit BEFORE the global 20mb
// parser. body-parser skips re-parsing once req._body is set, so this scoped limit caps the
// base64-attachment -> Buffer -> form-data memory amplification (a DoS vector) before the
// handler ever runs. Reject oversized bodies with a clean 413 instead of the generic 500.
// Apply CORS first so 413 responses include the expected headers (the global cors() middleware
// runs later and would otherwise never execute for error responses).
app.use('/feedback', cors({ origin: true, credentials: true }));
app.use('/feedback', express.json({ limit: '2mb' }));
app.use('/feedback', express.urlencoded({ limit: '2mb', extended: true }));
app.use('/feedback', (error: unknown, _req: Request, res: Response, next: NextFunction) => {
  const isPayloadTooLarge =
    !!error &&
    typeof error === 'object' &&
    (error as { type?: string }).type === 'entity.too.large';

  if (isPayloadTooLarge) {
    res.status(413).json({ message: 'Feedback payload too large.' });
    return;
  }

  next(error);
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(corsMiddleware());

// Trust only the immediate reverse proxy.
// Avoid `true` because clients can spoof X-Forwarded-For and bypass IP rate limits.
app.set('trust proxy', 1);

app.use('/v2', authMiddleware({ mode: 'optional' }), videoRouter);

app.use(
  ANONYMOUS_REPORT_PATHS,
  authMiddleware({ mode: 'optional' }),
  anonymousRateLimitMiddleware()
);

app.use((_req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

const veraPath = path.join(runtimeDir, './dist');
const meetingLinkVideoClient = makeVideoClient$();

PUBLIC_BUILD_FOLDERS.forEach((folder) => {
  app.use(`/${folder}`, express.static(path.join(veraPath, folder)));
});

app.get(MEETING_LINK_PATHS, (req, res, next) => {
  const isMeetingLink = hasVerifiedSessionKey({
    input: { sessionKey: req.params.roomIdentifier },
    videoClient: meetingLinkVideoClient,
  });
  if (!isMeetingLink) {
    next();
    return;
  }
  res.sendFile(path.join(veraPath, 'index.html'));
});

app.use(
  authMiddleware({
    excludedPaths: [
      '/_/health',
      '/v2/hooks/session',
      '/v2/hooks/captions',
      '/v2/hooks/archive',
      '/client-logs',
      '/client-logs/batch',
      '/feedback/report',
      '/.well-known/apple-app-site-association',
      '/.well-known/assetlinks.json',
      SIGN_IN_PATH,
      SIGN_OUT_PATH,
      ...authCallbackPaths,
    ],
  })
);

app.use(router);

app.use(express.static(veraPath));

app.get('/*', (_req: Request, res: Response) => {
  res.sendFile(path.join(veraPath, 'index.html'));
});

app.use(errorHandler);

const startServer: (port?: number) => Promise<Server> = (port = defaultPort) => {
  return new Promise((res) => {
    const server: Server = app.listen(port, () => {
      res(server);

      console.log('Server listening on port', port);
      logAuthFeatures();

      if (process.env.FRONTEND_TARGET) {
        console.log('App listening at', process.env.FRONTEND_TARGET);
      }
    });
  });
};

export default startServer;
