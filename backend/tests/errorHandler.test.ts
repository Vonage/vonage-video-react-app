import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../middleware/errorHandler';
import { ValidationError } from '../errors/ValidationError';

function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    headers: { accept: 'application/json' },
    xhr: false,
    ...overrides,
  } as Request;
}

function createMockResponse(): Response {
  const res = {
    headersSent: false,
    statusCode: 200,
    status: jest.fn(function (this: Response, code: number) {
      this.statusCode = code;
      return this;
    }) as unknown as (code: number) => Response,
    json: jest.fn(function (this: Response) {
      return this;
    }) as unknown as (body?: unknown) => Response,
    send: jest.fn(function (this: Response) {
      return this;
    }) as unknown as (body?: unknown) => Response,
    render: jest.fn() as (view: string, options?: object) => void,
    setHeader: jest.fn(),
  } as unknown as Response;
  return res;
}

const noopNext: NextFunction = () => {};

describe('errorHandler', () => {
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('returns early when headers already sent', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    res.headersSent = true;

    errorHandler(new Error('test'), req, res, noopNext);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('returns JSON for application/json requests', () => {
    const req = createMockRequest({ headers: { accept: 'application/json' } });
    const res = createMockResponse();

    errorHandler(new Error('Something broke'), req, res, noopNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String),
        severity: 'error',
        statusCode: 500,
      })
    );
  });

  it('preserves ValidationError statusCode and returns JSON', () => {
    const req = createMockRequest({ headers: { accept: 'application/json' } });
    const res = createMockResponse();
    const validationError = new ValidationError([{ path: ['field'], message: 'Invalid' }]);

    errorHandler(validationError, req, res, noopNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        severity: 'error',
      })
    );
  });

  it('returns HTML for text/html requests', () => {
    const req = createMockRequest({ headers: { accept: 'text/html' } });
    const res = createMockResponse();

    errorHandler(new Error('test'), req, res, noopNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith(
      'index',
      expect.objectContaining({
        error: expect.objectContaining({
          message: expect.any(String),
          statusCode: 500,
        }),
      })
    );
  });

  it('returns plain text for other request types', () => {
    const req = createMockRequest({ headers: { accept: 'text/plain' } });
    const res = createMockResponse();

    errorHandler(new Error('test'), req, res, noopNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.any(String));
  });

  it('treats xhr as JSON request', () => {
    const req = createMockRequest({ xhr: true, headers: {} });
    const res = createMockResponse();

    errorHandler(new Error('test'), req, res, noopNext);

    expect(res.json).toHaveBeenCalled();
  });
});
