import { useEffect, useCallback, useMemo } from 'react';
import { IMyDevice } from 'matrix-js-sdk';
import { useQuery } from '@tanstack/react-query';
import { CryptoEvent, CryptoEventHandlerMap } from 'matrix-js-sdk/lib/crypto';
import { useMatrixClient } from './useMatrixClient';

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

const DEVICES_QUERY_KEY = ['devices'];

export function useDeviceList(): [undefined | IMyDevice[], () => Promise<void>] {
  const mx = useMatrixClient();

  const fetchDevices = useCallback(async () => {
    const data = await mx.getDevices();
    return data.devices ?? [];
  }, [mx]);

  const { data: deviceList, refetch } = useQuery({
    queryKey: DEVICES_QUERY_KEY,
    queryFn: fetchDevices,
    staleTime: 0,
    gcTime: Infinity,
    refetchOnMount: 'always',
  });

  const refreshDeviceList = useCallback(async () => {
    await refetch();
  }, [refetch]);

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

  return [deviceList ?? undefined, refreshDeviceList];
}

export const useDeviceIds = (devices: IMyDevice[] | undefined): string[] => {
  const devicesId = useMemo(() => devices?.map((device) => device.device_id) ?? [], [devices]);

  return devicesId;
};

export const useSplitCurrentDevice = (
  devices: IMyDevice[] | undefined
): [IMyDevice | undefined, IMyDevice[] | undefined] => {
  const mx = useMatrixClient();
  const currentDeviceId = mx.getDeviceId();
  const currentDevice = useMemo(
    () => devices?.find((d) => d.device_id === currentDeviceId),
    [devices, currentDeviceId]
  );
  const otherDevices = useMemo(
    () => devices?.filter((device) => device.device_id !== currentDeviceId),
    [devices, currentDeviceId]
  );

  return [currentDevice, otherDevices];
};
