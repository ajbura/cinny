import { useEffect, useCallback } from 'react';
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

export function useDeviceList(): [null | IMyDevice[], () => Promise<void>] {
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

  return [deviceList ?? null, refreshDeviceList];
}
