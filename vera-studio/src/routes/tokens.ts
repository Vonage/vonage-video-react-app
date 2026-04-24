import type { Request, Response } from 'express';
import { Router } from 'express';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const workspaceRoot = process.env.npm_config_local_prefix as string;
const designTokensPath = path.join(workspaceRoot, 'designTokens.json');

const tokensRouter = Router();

tokensRouter.get('/', (_req: Request, res: Response) => {
  try {
    const isTokensFilePresent = fs.existsSync(designTokensPath);

    if (!isTokensFilePresent) {
      res.status(404).json({ error: 'designTokens.json not found' });
      return;
    }

    const raw = fs.readFileSync(designTokensPath, 'utf-8');
    res.status(200).json(JSON.parse(raw));
  } catch {
    res.status(500).json({ error: 'Unable to read design tokens' });
  }
});

tokensRouter.post('/', (req: Request, res: Response) => {
  try {
    const tokens = req.body;

    if (!tokens || typeof tokens !== 'object') {
      res.status(400).json({ error: 'Invalid token payload' });
      return;
    }

    fs.writeFileSync(designTokensPath, JSON.stringify(tokens, null, 2) + '\n', 'utf-8');

    execSync('yarn sync:theme-tokens', { cwd: workspaceRoot, stdio: 'inherit' });

    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ error: 'Unable to save and sync design tokens' });
  }
});

export default tokensRouter;
