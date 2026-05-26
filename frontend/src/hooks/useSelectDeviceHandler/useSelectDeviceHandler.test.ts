import { renderHook } from '@testing-library/react';
import { ErrorCode } from '@core/errors';
import { mediaDevices$ } from '@core/stores';
import { t } from 'i18next';
import { describe, expect, it, vi } from 'vitest';
import useSelectDeviceHandler from './useSelectDeviceHandler';

describe('useSelectDeviceHandler', () => {
  it('maps device access errors with a context-aware message', async () => {
    const selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice');

    const { result } = renderHook(() => useSelectDeviceHandler());

    selectDeviceSpy.mockRejectedValueOnce({
      type: ErrorCode.DeviceAccess,
      message: 'Permission denied',
    });

    await expect(
      result.current.handleSelectDevice({
        mediaDeviceKind: 'videoinput',
        deviceId: 'camera-2',
      })
    ).rejects.toMatchObject({
      type: ErrorCode.DeviceAccess,
      fallbackMessage: t('devices.select.accessDenied', {
        device: t('devices.video.camera.full'),
      }),
    });

    expect(selectDeviceSpy).toHaveBeenCalledWith('videoinput', 'camera-2');
  });
});
