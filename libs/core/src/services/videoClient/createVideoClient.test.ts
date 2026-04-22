import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import createVideoClient from './createVideoClient';

vi.mock('@trpc/client', () => {
  const httpBatchLink = vi.fn(() => 'mock-link');

  const mutate = vi.fn();

  const createTRPCClient = vi.fn(() => ({
    createSession: { mutate },
    joinSession: { mutate },
    createSessionAndJoin: { mutate },
    startArchive: { mutate },
    stopArchive: { mutate },
    searchArchives: { mutate },
    enableCaptions: { mutate },
    disableCaptions: { mutate },
    ensureCaptionsEnabled: { mutate },
  }));

  return { createTRPCClient, httpBatchLink };
});

describe('createVideoClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a client with httpBatchLink when given link options', () => {
    const linkOptions = { url: 'http://localhost:4000/trpc' };

    createVideoClient(linkOptions);

    expect(httpBatchLink).toHaveBeenCalledWith(linkOptions);
    expect(createTRPCClient).toHaveBeenCalledWith({
      links: ['mock-link'],
    });
  });

  it('should create a client with provided links array', () => {
    const links = ['custom-link'] as never[];

    createVideoClient(links);

    expect(httpBatchLink).not.toHaveBeenCalled();
    expect(createTRPCClient).toHaveBeenCalledWith({
      links,
    });
  });

  it('should flatten the proxy so procedures are called directly instead of via .mutate', async () => {
    const client = createVideoClient({ url: 'http://localhost:4000/trpc' });

    const payload = { roomName: 'test-room' };
    await client.createSession(payload);

    const mockTrpcClient = vi.mocked(createTRPCClient).mock.results[0].value;
    expect(mockTrpcClient.createSession.mutate).toHaveBeenCalledWith(payload);
  });

  it('should throw when accessing a procedure that does not exist', () => {
    const client = createVideoClient({ url: 'http://localhost:4000/trpc' });

    expect(() => {
      void (client as Record<string, unknown>).nonExistent;
    }).toThrow('Procedure nonExistent does not exist on the video client');
  });
});
