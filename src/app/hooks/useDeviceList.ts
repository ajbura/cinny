import { useState, useEffect, useCallback } from 'react';
import { IMyDevice } from 'matrix-js-sdk';
import { CryptoEvent, CryptoEventHandlerMap } from 'matrix-js-sdk/lib/crypto';
import { useMatrixClient } from './useMatrixClient';
import { useAlive } from './useAlive';

export const useDeviceListChange = (
  onChange: CryptoEventHandlerMap[CryptoEvent.DevicesUpdated]
) => {
  const mx = useMatrixClient();
  useEffect(() => {
    mx.on(CryptoEvent.DevicesUpdated, onChange);
    return () => {
      mx.removeListener(CryptoEvent.DevicesUpdated, onChange);
    };
  }, [mx, onChange]);
};

export function useDeviceList(): [null | IMyDevice[], () => Promise<void>] {
  const mx = useMatrixClient();
  const [deviceList, setDeviceList] = useState<IMyDevice[] | null>(null);
  const alive = useAlive();

  const refreshDeviceList = useCallback(async () => {
    const data = await mx.getDevices();
    if (alive()) {
      setDeviceList(data.devices || []);
    }
  }, [mx, alive]);

  useDeviceListChange(
    useCallback(
      (users) => {
        const userId = mx.getUserId();
        if (userId && users.includes(userId)) {
          refreshDeviceList();
        }
      },
      [mx, refreshDeviceList]
    )
  );

  useEffect(() => {
    refreshDeviceList();
  }, [refreshDeviceList]);

  return [deviceList, refreshDeviceList];
}
