// loads environment variables from .env file
import './helpers/config';

import express, { Express, Request, Response } from 'express';
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
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Restrict credentialed CORS to an explicit allowlist instead of reflecting any origin.
// Reflecting `origin: true` with credentials lets any site make authenticated cross-origin
// requests. Configure CORS_ALLOWED_ORIGINS (comma-separated) with the origins that embed
// <vera-room> against a remote API; when unset, only same-origin / non-browser requests
// (no Origin header) are allowed.
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      // Deny by not echoing the origin (no Access-Control-Allow-Origin header) rather than
      // throwing, so the browser blocks the response without a 500.
      callback(null, false);
    },
    credentials: true,
  })
);
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
