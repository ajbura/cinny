import { useEffect } from 'react';
import { CryptoApi } from 'matrix-js-sdk/lib/crypto-api';
import { AsyncStatus, useAsyncCallback } from './useAsyncCallback';
import { verifiedDevice } from '../utils/matrix-crypto';

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
