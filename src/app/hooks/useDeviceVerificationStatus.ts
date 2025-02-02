import { useCallback, useEffect, useState } from 'react';
import { CryptoApi } from 'matrix-js-sdk/lib/crypto-api';
import { AsyncStatus, useAsyncCallback } from './useAsyncCallback';
import { verifiedDevice } from '../utils/matrix-crypto';
import { useAlive } from './useAlive';
import { fulfilledPromiseSettledResult } from '../utils/common';
import { useMatrixClient } from './useMatrixClient';
import { useDeviceListChange } from './useDeviceList';

export enum VerificationStatus {
  Unknown,
  Unverified,
  Verified,
  Unsupported,
}

export const useDeviceVerificationStatus = (
  crypto: CryptoApi | undefined,
  userId: string,
  deviceId: string | undefined
): VerificationStatus => {
  const mx = useMatrixClient();
  const [verificationState, getVerification] = useAsyncCallback(verifiedDevice);

  const updateStatus = useCallback(() => {
    if (crypto && deviceId) getVerification(crypto, userId, deviceId);
  }, [crypto, deviceId, userId, getVerification]);

  useEffect(() => {
    updateStatus();
  }, [mx, updateStatus, userId]);

  useDeviceListChange(
    useCallback(
      (userIds) => {
        if (userIds.includes(userId)) {
          updateStatus();
        }
      },
      [userId, updateStatus]
    )
  );

  if (verificationState.status === AsyncStatus.Success) {
    if (verificationState.data === null) return VerificationStatus.Unsupported;

    return verificationState.data ? VerificationStatus.Verified : VerificationStatus.Unverified;
  }

  return VerificationStatus.Unknown;
};

export const useUnverifiedDeviceCount = (
  crypto: CryptoApi | undefined,
  userId: string,
  devices: string[]
): number | undefined => {
  const [unverifiedCount, setUnverifiedCount] = useState<number>();
  const alive = useAlive();

  const updateCount = useCallback(async () => {
    let count = 0;
    if (crypto) {
      const promises = devices.map((deviceId) => verifiedDevice(crypto, userId, deviceId));
      const result = await Promise.allSettled(promises);
      const settledResult = fulfilledPromiseSettledResult(result);
      settledResult.forEach((status) => {
        if (status === false) {
          count += 1;
        }
      });
    }
    if (alive()) {
      setUnverifiedCount(count);
    }
  }, [crypto, userId, devices, alive]);

  useDeviceListChange(
    useCallback(
      (userIds) => {
        if (userIds.includes(userId)) {
          updateCount();
        }
      },
      [userId, updateCount]
    )
  );

  useEffect(() => {
    updateCount();
  }, [updateCount]);

  return unverifiedCount;
};
