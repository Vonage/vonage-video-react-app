import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import type { Server } from 'http';
import { fileURLToPath } from 'url';
import type { ViteDevServer } from 'vite';
import router from './routes/index';

const runtimeDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultPort = Number(process.env.VERA_STUDIO_PORT ?? 5000);

const createApp = async (): Promise<{ app: Express; viteDevServer: ViteDevServer | null }> => {
  const app: Express = express();

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ limit: '20mb', extended: true }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(bodyParser.json());
  app.set('trust proxy', true);

  app.use('/api', router);

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  });

  let viteDevServer: ViteDevServer | null = null;

  const { createServer: createViteServer } = await import('vite');

  viteDevServer = await createViteServer({
    root: path.resolve(runtimeDirectory, '../frontend'),
    server: { middlewareMode: true },
    appType: 'custom',
  });

  app.use(viteDevServer.middlewares);

  app.get('*', async (req: Request, res: Response) => {
    const url = req.originalUrl;
    const htmlPath = path.resolve(runtimeDirectory, '../frontend/index.html');
    let template = fs.readFileSync(htmlPath, 'utf-8');
    template = await viteDevServer.transformIndexHtml(url, template);
    res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
  });

  return { app, viteDevServer };
};

const startServer = async (port: number = defaultPort): Promise<Server> => {
  const { app } = await createApp();

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`[\x1b[36m${'vera-studio'}\x1b[0m] Server listening on port ${port}`);
      resolve(server);
    });
  });
};

export default startServer;
