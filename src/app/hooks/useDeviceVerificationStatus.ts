import { useEffect, useState } from 'react';
import { CryptoApi } from 'matrix-js-sdk/lib/crypto-api';
import { AsyncStatus, useAsyncCallback } from './useAsyncCallback';
import { verifiedDevice } from '../utils/matrix-crypto';
import { useAlive } from './useAlive';
import { fulfilledPromiseSettledResult } from '../utils/common';

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
  const [verificationState, getVerification] = useAsyncCallback(verifiedDevice);

  useEffect(() => {
    if (crypto && deviceId) getVerification(crypto, userId, deviceId);
  }, [getVerification, userId, crypto, deviceId]);

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

  useEffect(() => {
    const findCount = async () => {
      if (crypto) {
        const promises = devices.map((deviceId) => verifiedDevice(crypto, userId, deviceId));
        const result = await Promise.allSettled(promises);
        const settledResult = fulfilledPromiseSettledResult(result);
        return settledResult.reduce((count, status) => {
          if (status === false) {
            return count + 1;
          }
          return count;
        }, 0);
      }
      return 0;
    };
    findCount().then((count) => {
      if (alive()) {
        setUnverifiedCount(count);
      }
    });
  }, [alive, crypto, userId, devices]);

  return unverifiedCount;
};
