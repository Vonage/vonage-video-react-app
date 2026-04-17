import type { Request, Response } from 'express';
import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'vera-studio' });
});

export default healthRouter;
