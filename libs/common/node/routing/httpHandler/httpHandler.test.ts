import { describe, it, expect, vi, type Mock } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import httpHandler from './httpHandler';

describe('httpHandler', () => {
  describe('single handler creation', () => {
    it('should create a promise-based handler from a callback', async () => {
      const { mockRequest, mockResponse, mockNext } = setupMocks();

      const callback = vi.fn((req, res: Response) => {
        return res.json({ success: true });
      });

      const handler = httpHandler(callback);

      const result = handler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Handler should return a promise
      expect(result).toBeInstanceOf(Promise);

      await Promise.resolve(result);

      expect(callback).toHaveBeenCalledWith(mockRequest, mockResponse, expect.any(Function));
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('should make sync handlers promise-based', async () => {
      const { mockRequest, mockResponse, mockNext } = setupMocks();

      // Regular sync callback
      const callback = vi.fn((req, res: Response) => {
        return res.json({ data: 'sync' });
      });

      const handler = httpHandler(callback);

      const result = handler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      ) as unknown as Promise<void>;

      // Even sync callbacks become promise-based
      expect(result).toBeInstanceOf(Promise);

      await result;

      expect(callback).toHaveBeenCalled();
    });

    it('should handle async callbacks', async () => {
      const { mockRequest, mockResponse, mockNext } = setupMocks();

      const callback = vi.fn(async (req, res: Response) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return res.json({ data: 'async result' });
      });

      const handler = httpHandler(callback);

      const result = handler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      await Promise.resolve(result);

      expect(callback).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ data: 'async result' });
    });

    describe('error handling and control', () => {
      it('should catch and forward synchronous errors to next()', async () => {
        const { mockRequest, mockResponse, mockNext } = setupMocks();
        const error = new Error('Synchronous error');

        const callback = vi.fn(() => {
          throw error;
        });

        const handler = httpHandler(callback);

        const result = handler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext as NextFunction
        );

        await Promise.resolve(result);

        expect(callback).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it('should catch and forward async/Promise rejections to next()', async () => {
        const { mockRequest, mockResponse, mockNext } = setupMocks();
        const error = new Error('Async error');

        const callback = vi.fn(async () => {
          await Promise.resolve();
          throw error;
        });

        const handler = httpHandler(callback);

        const result = handler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext as NextFunction
        );

        await Promise.resolve(result);

        expect(callback).toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it('should handle Promise.reject() and forward to next()', async () => {
        const { mockRequest, mockResponse, mockNext } = setupMocks();
        const error = new Error('Promise rejection');

        const callback = vi.fn(() => {
          return Promise.reject(error);
        });

        const handler = httpHandler(callback);

        const result = handler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext as NextFunction
        );

        await Promise.resolve(result);

        expect(mockNext).toHaveBeenCalledWith(error);
      });

      it('should prevent server crashes by catching unhandled errors', async () => {
        const { mockRequest, mockResponse, mockNext } = setupMocks();

        const callback = vi.fn(() => {
          // This would normally crash Express without error handling
          throw new Error('Unhandled error that would crash server');
        });

        const handler = httpHandler(callback);

        // Should not throw
        const promise = handler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext as NextFunction
        );

        await expect(Promise.resolve(promise)).resolves.not.toThrow();
        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      });

      it('should catch errors in middleware chain and stop execution', async () => {
        const { mockRequest, mockResponse, mockNext } = setupMocks();
        const error = new Error('Middleware error');

        const middleware = vi.fn(() => {
          throw error;
        });

        const callback = vi.fn((req, res: Response) => {
          return res.json({ success: true });
        });

        const handler = httpHandler(middleware, callback);

        const result = handler(
          mockRequest as Request,
          mockResponse as Response,
          mockNext as NextFunction
        );

        await Promise.resolve(result);

        expect(middleware).toHaveBeenCalled();
        expect(callback).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('handler composition with middlewares', () => {
    it('should compose multiple middlewares with a final callback', async () => {
      const { mockRequest, mockResponse, mockNext } = setupMocks();
      const executionOrder: number[] = [];

      const middleware1 = vi.fn((req, res, next: NextFunction) => {
        executionOrder.push(1);
        return next();
      });

      const middleware2 = vi.fn((req, res, next: NextFunction) => {
        executionOrder.push(2);
        return next();
      });

      const callback = vi.fn((req, res: Response) => {
        executionOrder.push(3);
        return res.json({ success: true });
      });

      const handler = httpHandler(middleware1, middleware2, callback);

      const result = handler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      await Promise.resolve(result);

      expect(executionOrder).toEqual([1, 2, 3]);
      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it('should stop execution if middleware calls next with error', async () => {
      const { mockRequest, mockResponse, mockNext } = setupMocks();
      const error = new Error('Middleware error');

      const middleware1 = vi.fn((req, res, next: NextFunction) => {
        return next(error);
      });

      const middleware2 = vi.fn();
      const callback = vi.fn();

      const handler = httpHandler(middleware1, middleware2, callback);

      const result = handler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      await Promise.resolve(result);

      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).not.toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should allow middlewares to modify request object', async () => {
      const { mockRequest, mockResponse, mockNext } = setupMocks();

      const middleware = vi.fn((req, res, next: NextFunction) => {
        (req as Request & { userId: string }).userId = 'user123';
        return next();
      });

      const callback = vi.fn((req, res: Response) => {
        expect((req as Request & { userId: string }).userId).toBe('user123');
        return res.json({ userId: (req as Request & { userId: string }).userId });
      });

      const handler = httpHandler(middleware, callback);

      const result = handler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      await Promise.resolve(result);

      expect(mockResponse.json).toHaveBeenCalledWith({ userId: 'user123' });
    });

    it('should handle async middlewares', async () => {
      const { mockRequest, mockResponse, mockNext } = setupMocks();
      const executionOrder: string[] = [];

      const middleware1 = vi.fn(async (req, res, next: NextFunction) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        executionOrder.push('middleware1');
        return next();
      });

      const middleware2 = vi.fn((req, res, next: NextFunction) => {
        executionOrder.push('middleware2');
        return next();
      });

      const callback = vi.fn((req, res: Response) => {
        executionOrder.push('callback');
        return res.json({ success: true });
      });

      const handler = httpHandler(middleware1, middleware2, callback);

      const result = handler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      await Promise.resolve(result);

      expect(executionOrder).toEqual(['middleware1', 'middleware2', 'callback']);
    });
  });
});

function setupMocks() {
  const mockRequest: Partial<Request> = {
    body: {},
    headers: {},
    params: {},
    query: {},
  };

  const mockResponse: Partial<Response> = {
    headersSent: false,
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };

  Object.defineProperty(mockResponse, 'writableEnded', {
    value: false,
    writable: true,
  });

  const mockNext: Mock = vi.fn();

  return { mockRequest, mockResponse, mockNext };
}
