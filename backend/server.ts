// loads environment variables from .env file
import './helpers/config';

import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server } from 'http';
import router from './routes';
import { fileURLToPath } from 'url';
import { errorHandler, helmetMiddleware, rateLimitMiddleware } from './middleware';

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

const app: Express = express();

app.use(helmetMiddleware);
app.use(rateLimitMiddleware);

// Parse the unauthenticated /feedback endpoint with a small limit BEFORE the global 20mb
// parser. body-parser skips re-parsing once req._body is set, so this scoped limit caps the
// base64-attachment -> Buffer -> form-data memory amplification (a DoS vector) before the
// handler ever runs. Reject oversized bodies with a clean 413 instead of the generic 500.
app.use('/feedback', express.json({ limit: '2mb' }));
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
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

// Trust only the immediate reverse proxy.
// Avoid `true` because clients can spoof X-Forwarded-For and bypass IP rate limits.
app.set('trust proxy', 1);
app.use(router);

app.use((_req, res, next) => {
  // This is needed to remove the deployed application from being indexed by Search engines
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

const veraPath = path.join(runtimeDir, './dist');
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

      if (process.env.FRONTEND_TARGET) {
        console.log('App listening at', process.env.FRONTEND_TARGET);
      }
    });
  });
};

export default startServer;
