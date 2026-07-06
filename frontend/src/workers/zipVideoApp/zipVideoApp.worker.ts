import {
  BlobReader,
  BlobWriter,
  TextReader,
  Uint8ArrayReader,
  ZipReader,
  ZipWriter,
} from '@zip.js/zip.js';
import { StaticEasyWebWorker } from 'easy-web-worker';
import axios from 'axios';

import type { ZipVideoAppPayload, ZipVideoAppResult } from './types';

new StaticEasyWebWorker<ZipVideoAppPayload, ZipVideoAppResult>((message) => {
  const { payload } = message;

  try {
    const buffer = videoClient.zipVideoApp(payload.theme, payload.config);
  } catch (error) {}
});
