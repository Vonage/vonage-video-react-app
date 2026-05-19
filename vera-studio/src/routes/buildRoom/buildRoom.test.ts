import { beforeEach, describe, expect, it, vi } from 'vitest';
import path from 'path';

type RouteStack = {
  stack: Array<{
    route: {
      stack: Array<{
        handle: (req: unknown, res: unknown) => void;
      }>;
    };
  }>;
};

type ExecCallback = (error: Error | null) => void;

const execMock = vi.fn();

vi.mock('child_process', () => ({
  exec: execMock,
}));

describe('build route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 500 when build command fails', async () => {
    const { default: buildRouter } = await import('./buildRoom');
    const buildHandler = (buildRouter as unknown as RouteStack).stack[0].route.stack[0].handle;

    execMock.mockImplementation((_command, _options, callback: ExecCallback) => {
      callback(new Error('boom'));
    });

    const jsonMock = vi.fn();
    const statusMock = vi.fn(() => ({ json: jsonMock }));
    const reqMock = { setTimeout: vi.fn() };
    const resMock = {
      setTimeout: vi.fn(),
      status: statusMock,
      json: jsonMock,
      download: vi.fn(),
    };

    buildHandler(reqMock, resMock);

    const executionOptions = execMock.mock.calls[0][1] as { cwd: string };

    expect(execMock).toHaveBeenCalledWith(
      'yarn build room zip',
      { cwd: executionOptions.cwd },
      expect.anything()
    );
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Build failed', details: 'boom' });
  });

  it('downloads room.zip when build succeeds', async () => {
    const { default: buildRouter } = await import('./buildRoom');
    const buildHandler = (buildRouter as unknown as RouteStack).stack[0].route.stack[0].handle;

    execMock.mockImplementation((_command, _options, callback: ExecCallback) => {
      callback(null);
    });

    const reqMock = { setTimeout: vi.fn() };
    const resMock = {
      setTimeout: vi.fn(),
      status: vi.fn(() => ({ json: vi.fn() })),
      json: vi.fn(),
      download: vi.fn((_path, _name, callback: () => void) => {
        callback();
      }),
    };

    buildHandler(reqMock, resMock);

    const executionOptions = execMock.mock.calls[0][1] as { cwd: string };
    const expectedZipPath = path.join(executionOptions.cwd, 'room.zip');

    expect(resMock.download).toHaveBeenCalledWith(expectedZipPath, 'room.zip', expect.anything());
  });
});
