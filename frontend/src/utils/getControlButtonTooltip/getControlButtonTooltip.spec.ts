import { describe, it, expect } from 'vitest';
import { useTranslation } from 'react-i18next';
import { renderHook } from '@testing-library/react';
import getControlButtonTooltip from './getControlButtonTooltip';

describe('getControlButtonTooltip', () => {
  const getTranslationFunction = () => {
    const { result } = renderHook(() => useTranslation());
    return result.current.t;
  };
  const t = getTranslationFunction();

  const testCases = [
    {
      name: 'audio control is disabled',
      options: {
        isAudio: true,
        allowMicrophoneControl: false, // Microphone control configured to be disabled
        allowCameraControl: true,
        isAudioEnabled: false,
        isVideoEnabled: false,
      },
      expectedTranslation: t('devices.audio.disabled'),
    },
    {
      name: 'audio is disabled',
      options: {
        isAudio: true,
        allowMicrophoneControl: true,
        allowCameraControl: true,
        isAudioEnabled: false,
        isVideoEnabled: false,
      },
      // When audio is disabled, the tooltip should prompt to enable it
      expectedTranslation: t('devices.audio.enable'),
    },
    {
      name: 'audio is enabled',
      options: {
        isAudio: true,
        allowMicrophoneControl: true,
        allowCameraControl: true,
        isAudioEnabled: true,
        isVideoEnabled: false,
      },
      // When audio is enabled, the tooltip should prompt to disable it
      expectedTranslation: t('devices.audio.disable'),
    },
    {
      name: 'video control is disabled',
      options: {
        isAudio: false,
        allowMicrophoneControl: true,
        allowCameraControl: false, // Camera control configured to be disabled
        isAudioEnabled: false,
        isVideoEnabled: false,
      },
      expectedTranslation: t('devices.video.disabled'),
    },
    {
      name: 'video is disabled',
      options: {
        isAudio: false,
        allowMicrophoneControl: true,
        allowCameraControl: true,
        isAudioEnabled: false,
        isVideoEnabled: false,
      },
      // When video is disabled, the tooltip should prompt to enable it
      expectedTranslation: t('devices.video.enable'),
    },
    {
      name: 'video is enabled',
      options: {
        isAudio: false,
        allowMicrophoneControl: true,
        allowCameraControl: true,
        isAudioEnabled: false,
        isVideoEnabled: true,
      },
      // When video is enabled, the tooltip should prompt to disable it
      expectedTranslation: t('devices.video.disable'),
    },
  ];

  testCases.forEach((testCase) => {
    it(`should return correct translation when ${testCase.name}`, () => {
      const result = getControlButtonTooltip({
        ...testCase.options,
        t,
      });

      expect(result).toBe(testCase.expectedTranslation);
    });
  });
});
