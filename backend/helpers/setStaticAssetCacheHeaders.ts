import type { Response } from 'express';

function setStaticAssetCacheHeaders(res: Response) {
  res.set('Cache-Control', 'private, max-age=0, must-revalidate');
}

export default setStaticAssetCacheHeaders;
