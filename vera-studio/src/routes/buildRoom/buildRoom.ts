import type { Request, Response } from 'express';
import { Router } from 'express';
import { exec } from 'child_process';
import path from 'path';
import getWorkspaceRootPath from '../getWorkspaceRootPath';

const workspaceRoot = getWorkspaceRootPath();

const buildRouter = Router();

const BUILD_TIMEOUT_MS = 5 * 60 * 1000;

buildRouter.post('/room', (req: Request, res: Response) => {
  req.setTimeout(BUILD_TIMEOUT_MS);
  res.setTimeout(BUILD_TIMEOUT_MS);

  exec('yarn build room zip', { cwd: workspaceRoot }, (error) => {
    if (error) {
      res.status(500).json({ error: 'Build failed', details: error.message });
      return;
    }

    const zipPath = path.join(workspaceRoot, 'room.zip');

    res.download(zipPath, 'room.zip', (downloadError) => {
      if (downloadError) {
        res.status(500).json({ error: 'Failed to send artifact' });
      }
    });
  });
});

export default buildRouter;
