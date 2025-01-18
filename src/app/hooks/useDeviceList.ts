/* eslint-disable import/prefer-default-export */
import { useState, useEffect, useCallback } from 'react';
import { IMyDevice } from 'matrix-js-sdk';
import { CryptoEvent, CryptoEventHandlerMap } from 'matrix-js-sdk/lib/crypto';
import { useMatrixClient } from './useMatrixClient';
import { useAlive } from './useAlive';

export function useDeviceList(): [null | IMyDevice[], () => Promise<void>] {
  const mx = useMatrixClient();
  const [deviceList, setDeviceList] = useState<IMyDevice[] | null>(null);
  const alive = useAlive();

  const refreshDeviceList = useCallback(async () => {
    const data = await mx.getDevices();
    if (!alive()) return;
    setDeviceList(data.devices || []);
  }, [mx, alive]);

  useEffect(() => {
    refreshDeviceList();

    const handleDevicesUpdate: CryptoEventHandlerMap[CryptoEvent.DevicesUpdated] = (users) => {
      const userId = mx.getUserId();
      if (userId && users.includes(userId)) {
        refreshDeviceList();
      }
    };

    mx.on(CryptoEvent.DevicesUpdated, handleDevicesUpdate);
    return () => {
      mx.removeListener(CryptoEvent.DevicesUpdated, handleDevicesUpdate);
    };
  }, [mx, refreshDeviceList]);

  return [deviceList, refreshDeviceList];
}
