import { describe, it, expect } from 'vitest';
import { Publisher } from '@vonage/client-sdk-video';
import getInitialBackgroundFilter from './getInitialBackgroundFilter';

describe('getInitialBackgroundFilter', () => {
  it('returns "low-blur" if filter is backgroundBlur with low strength', () => {
    const mockPublisher = {
      getVideoFilter: () => ({
        type: 'backgroundBlur',
        blurStrength: 'low',
      }),
    } as unknown as Publisher;
    expect(getInitialBackgroundFilter(mockPublisher)).toBe('low-blur');
  });

  it('returns "high-blur" if filter is backgroundBlur with high strength', () => {
    const mockPublisher = {
      getVideoFilter: () => ({
        type: 'backgroundBlur',
        blurStrength: 'high',
      }),
    } as unknown as Publisher;
    expect(getInitialBackgroundFilter(mockPublisher)).toBe('high-blur');
  });

  it('returns image filename if filter is backgroundReplacement', () => {
    const mockPublisher = {
      getVideoFilter: () => ({
        type: 'backgroundReplacement',
        backgroundImgUrl: '/some/path/background1.jpg',
      }),
    } as unknown as Publisher;
    expect(getInitialBackgroundFilter(mockPublisher)).toBe('background1.jpg');
  });

  it('returns "none" if filter is backgroundReplacement but no filename', () => {
    const mockPublisher = {
      getVideoFilter: () => ({
        type: 'backgroundReplacement',
        backgroundImgUrl: '',
      }),
    } as unknown as Publisher;
    expect(getInitialBackgroundFilter(mockPublisher)).toBe('none');
  });

  it('returns "none" if filter is not set', () => {
    const mockPublisher = {
      getVideoFilter: () => undefined,
    } as unknown as Publisher;
    expect(getInitialBackgroundFilter(mockPublisher)).toBe('none');
  });

  it('returns "none" if publisher is not provided', () => {
    expect(getInitialBackgroundFilter(undefined)).toBe('none');
    expect(getInitialBackgroundFilter(null)).toBe('none');
  });

  it('returns "none" if filter type is unknown', () => {
    const mockPublisher = {
      getVideoFilter: () => ({
        type: 'otherType',
      }),
    } as unknown as Publisher;
    expect(getInitialBackgroundFilter(mockPublisher)).toBe('none');
  });

  it('returns dataUrl if filter is backgroundReplacement with a dataUrl', () => {
    const dataUrl = 'data:image/png;base64,somebase64data';
    const mockPublisher = {
      getVideoFilter: () => ({
        type: 'backgroundReplacement',
        backgroundImgUrl: dataUrl,
      }),
    } as unknown as Publisher;
    expect(getInitialBackgroundFilter(mockPublisher)).toBe(dataUrl);
  });

  it('returns "none" if filter is backgroundReplacement and backgroundImgUrl is undefined', () => {
    const mockPublisher = {
      getVideoFilter: () => ({
        type: 'backgroundReplacement',
        backgroundImgUrl: undefined,
      }),
    } as unknown as Publisher;
    expect(getInitialBackgroundFilter(mockPublisher)).toBe('none');
  });
});
