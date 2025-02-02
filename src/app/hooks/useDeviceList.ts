import { useEffect, useCallback, useMemo } from 'react';
import { IMyDevice } from 'matrix-js-sdk';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

  const queryClient = useQueryClient();
  const { data: deviceList } = useQuery({
    queryKey: DEVICES_QUERY_KEY,
    queryFn: fetchDevices,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: Infinity,
    refetchOnMount: 'always',
  });

  useDeviceListChange(
    useCallback(
      (users) => {
        const userId = mx.getUserId();
        if (userId && users.includes(userId)) {
          queryClient.refetchQueries({
            queryKey: DEVICES_QUERY_KEY,
          });
        }
      },
      [mx, queryClient]
    )
  );

  const refreshDeviceList = useCallback(async () => {
    await queryClient.refetchQueries({
      queryKey: DEVICES_QUERY_KEY,
    });
  }, [queryClient]);

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
