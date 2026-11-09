import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import express from 'express';
import request from 'supertest';
import { expect, it, onTestFinished } from 'vitest';
import setStaticAssetCacheHeaders from '../helpers/setStaticAssetCacheHeaders';

it('makes the browser revalidate every static file so a new deploy replaces the cached copy', async () => {
  expect.assertions(4);
  const rootPath = await mkdtemp(path.join(tmpdir(), 'static-assets-'));
  onTestFinished(() => rm(rootPath, { recursive: true, force: true }));
  const imagePath = path.join(rootPath, 'logo.svg');
  await writeFile(path.join(rootPath, 'index.html'), '<!doctype html>');
  await writeFile(imagePath, '<svg>old</svg>');

  const app = express().use(express.static(rootPath, { setHeaders: setStaticAssetCacheHeaders }));
  const htmlResponse = await request(app).get('/index.html');
  const oldImageResponse = await request(app).get('/logo.svg');

  await writeFile(imagePath, '<svg>new version</svg>');
  const newImageResponse = await request(app)
    .get('/logo.svg')
    .set('If-None-Match', oldImageResponse.headers.etag);

  expect(htmlResponse.headers['cache-control']).toBe('private, max-age=0, must-revalidate');
  expect(oldImageResponse.headers['cache-control']).toBe('private, max-age=0, must-revalidate');
  expect(newImageResponse.status).toBe(200);
  expect(newImageResponse.body.toString()).toBe('<svg>new version</svg>');
});
