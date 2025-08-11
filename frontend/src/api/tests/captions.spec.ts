import { describe, expect, it, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { enableCaptions, disableCaptions } from '../captions';
import { API_URL } from '../../utils/constants';

vi.mock('axios');

const mockPost = vi.spyOn(axios, 'post');

describe('captions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('enableCaptions', () => {
    it('should call axios.post with correct URL and return response', async () => {
      const mockResponse = {
        data: { captionsId: 'test-captions-id' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      mockPost.mockResolvedValue(mockResponse);

      const roomName = 'test-room';
      const tokenRole = 'admin';

      const result = await enableCaptions(roomName, tokenRole);

      expect(mockPost).toHaveBeenCalledWith(
        `${API_URL}/session/${roomName}/${tokenRole}/enableCaptions`
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      mockPost.mockRejectedValue(mockError);

      const roomName = 'test-room';
      const tokenRole = 'participant';

      await expect(enableCaptions(roomName, tokenRole)).rejects.toThrow('API Error');
    });

    it('should work with different user roles', async () => {
      const mockResponse = {
        data: { captionsId: 'another-captions-id' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      mockPost.mockResolvedValue(mockResponse);

      const roomName = 'meeting-room-123';
      const tokenRole = 'moderator';

      const result = await enableCaptions(roomName, tokenRole);

      expect(mockPost).toHaveBeenCalledWith(
        `${API_URL}/session/${roomName}/${tokenRole}/enableCaptions`
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle response with error message', async () => {
      const mockResponse = {
        data: { captionsId: 'test-captions-id', message: 'Warning: Limited features' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      mockPost.mockResolvedValue(mockResponse);

      const roomName = 'test-room';
      const tokenRole = 'admin';

      const result = await enableCaptions(roomName, tokenRole);

      expect(result.data.message).toBe('Warning: Limited features');
      expect(result.data.captionsId).toBe('test-captions-id');
    });
  });

  describe('disableCaptions', () => {
    it('should call axios.post with correct URL and return response', async () => {
      const mockResponse = {
        data: { messageResponse: 'Captions disabled successfully' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      mockPost.mockResolvedValue(mockResponse);

      const roomName = 'test-room';
      const captionsId = 'test-captions-id';
      const tokenRole = 'admin';

      const result = await disableCaptions(roomName, captionsId, tokenRole);

      expect(mockPost).toHaveBeenCalledWith(
        `${API_URL}/session/${roomName}/${captionsId}/${tokenRole}/disableCaptions`
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Disable captions failed');
      mockPost.mockRejectedValue(mockError);

      const roomName = 'test-room';
      const captionsId = 'test-captions-id';
      const tokenRole = 'participant';

      await expect(disableCaptions(roomName, captionsId, tokenRole)).rejects.toThrow(
        'Disable captions failed'
      );
    });

    it('should work with different parameters', async () => {
      const mockResponse = {
        data: { messageResponse: 'Captions stopped' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      mockPost.mockResolvedValue(mockResponse);

      const roomName = 'another-room';
      const captionsId = 'different-captions-id';
      const tokenRole = 'moderator';

      const result = await disableCaptions(roomName, captionsId, tokenRole);

      expect(mockPost).toHaveBeenCalledWith(
        `${API_URL}/session/${roomName}/${captionsId}/${tokenRole}/disableCaptions`
      );
      expect(result.data.messageResponse).toBe('Captions stopped');
    });

    it('should handle response with error message', async () => {
      const mockResponse = {
        data: { messageResponse: 'Captions disabled', message: 'Some cleanup required' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      mockPost.mockResolvedValue(mockResponse);

      const roomName = 'test-room';
      const captionsId = 'test-captions-id';
      const tokenRole = 'admin';

      const result = await disableCaptions(roomName, captionsId, tokenRole);

      expect(result.data.message).toBe('Some cleanup required');
      expect(result.data.messageResponse).toBe('Captions disabled');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.name = 'AxiosError';
      mockPost.mockRejectedValue(networkError);

      const roomName = 'test-room';
      const captionsId = 'test-captions-id';
      const tokenRole = 'admin';

      await expect(disableCaptions(roomName, captionsId, tokenRole)).rejects.toThrow(
        'Network Error'
      );
    });
  });
});
