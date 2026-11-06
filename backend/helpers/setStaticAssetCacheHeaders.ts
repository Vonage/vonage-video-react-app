import type { Response } from 'express';

function setStaticAssetCacheHeaders(res: Response, filePath: string) {
  const isHtmlFile = filePath.endsWith('.html');
  res.set(
    'Cache-Control',
    isHtmlFile ? 'private, max-age=0, must-revalidate' : 'private, max-age=86400'
  );
}

export default setStaticAssetCacheHeaders;
