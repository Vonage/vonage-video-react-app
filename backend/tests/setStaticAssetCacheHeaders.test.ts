import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import express from 'express';
import request from 'supertest';
import { expect, it, onTestFinished } from 'vitest';
import setStaticAssetCacheHeaders from '../helpers/setStaticAssetCacheHeaders';

it('serves HTML with revalidation and other assets with a private one-day cache', async () => {
  expect.assertions(2);

  const rootPath = await mkdtemp(path.join(tmpdir(), 'static-assets-'));
  onTestFinished(() => rm(rootPath, { recursive: true, force: true }));
  await writeFile(path.join(rootPath, 'index.html'), '<!doctype html>');
  await writeFile(path.join(rootPath, 'index-abc123.js'), 'export {};');

  const app = express().use(express.static(rootPath, { setHeaders: setStaticAssetCacheHeaders }));
  const htmlResponse = await request(app).get('/index.html');
  const assetResponse = await request(app).get('/index-abc123.js');

  expect(htmlResponse.headers['cache-control']).toBe('private, max-age=0, must-revalidate');
  expect(assetResponse.headers['cache-control']).toBe('private, max-age=86400');
});
