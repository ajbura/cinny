import React, { useCallback, useState } from 'react';
import { Box, Button, config, Menu, Spinner, Text } from 'folds';
import { AuthDict, IMyDevice, MatrixError } from 'matrix-js-sdk';
import { SequenceCard } from '../../../components/sequence-card';
import { SequenceCardStyle } from '../styles.css';
import { ActionUIA, ActionUIAFlowsLoader } from '../../../components/ActionUIA';
import { DeviceDeleteBtn, DeviceTile } from './DeviceTile';
import { AsyncState, AsyncStatus, useAsync } from '../../../hooks/useAsyncCallback';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useUIAMatrixError } from '../../../hooks/useUIAFlows';
import { DeviceVerificationStatus } from '../../../components/DeviceVerificationStatus';
import { StartVerificationTile } from './Verificaton';
import { VerificationStatus } from '../../../hooks/useDeviceVerificationStatus';

type OtherDevicesProps = {
  devices: IMyDevice[];
  refreshDeviceList: () => Promise<void>;
  showVerification?: boolean;
};
export function OtherDevices({ devices, refreshDeviceList, showVerification }: OtherDevicesProps) {
  const mx = useMatrixClient();
  const crypto = mx.getCrypto();
  const [deleted, setDeleted] = useState<Set<string>>(new Set());

  const handleToggleDelete = useCallback((deviceId: string) => {
    setDeleted((deviceIds) => {
      const newIds = new Set(deviceIds);
      if (newIds.has(deviceId)) {
        newIds.delete(deviceId);
      } else {
        newIds.add(deviceId);
      }
      return newIds;
    });
  }, []);

  const [deleteState, setDeleteState] = useState<AsyncState<void, MatrixError>>({
    status: AsyncStatus.Idle,
  });

  const deleteDevices = useAsync(
    useCallback(
      async (authDict?: AuthDict) => {
        await mx.deleteMultipleDevices(Array.from(deleted), authDict);
      },
      [mx, deleted]
    ),
    useCallback(
      (state: typeof deleteState) => {
        if (state.status === AsyncStatus.Success) {
          setDeleted(new Set());
          refreshDeviceList();
        }
        setDeleteState(state);
      },
      [refreshDeviceList]
    )
  );
  const [authData, deleteError] = useUIAMatrixError(
    deleteState.status === AsyncStatus.Error ? deleteState.error : undefined
  );
  const deleting = deleteState.status === AsyncStatus.Loading || authData !== undefined;

  const handleCancelDelete = () => setDeleted(new Set());
  const handleCancelAuth = useCallback(() => {
    setDeleteState({ status: AsyncStatus.Idle });
  }, []);

  return devices.length > 0 ? (
    <>
      <Box direction="Column" gap="100">
        <Text size="L400">Others</Text>
        {devices
          .sort((d1, d2) => {
            if (!d1.last_seen_ts || !d2.last_seen_ts) return 0;
            return d1.last_seen_ts < d2.last_seen_ts ? 1 : -1;
          })
          .map((device) => (
            <SequenceCard
              key={device.device_id}
              className={SequenceCardStyle}
              variant={deleted.has(device.device_id) ? 'Critical' : 'SurfaceVariant'}
              direction="Column"
              gap="400"
            >
              <DeviceTile
                device={device}
                deleted={deleted.has(device.device_id)}
                refreshDeviceList={refreshDeviceList}
                disabled={deleting}
                options={
                  <DeviceDeleteBtn
                    deviceId={device.device_id}
                    deleted={deleted.has(device.device_id)}
                    onDeleteToggle={handleToggleDelete}
                    disabled={deleting}
                  />
                }
              />
              {showVerification && (
                <DeviceVerificationStatus
                  crypto={crypto}
                  userId={mx.getSafeUserId()}
                  deviceId={device.device_id}
                >
                  {(status) =>
                    status === VerificationStatus.Unverified && <StartVerificationTile />
                  }
                </DeviceVerificationStatus>
              )}
            </SequenceCard>
          ))}
      </Box>
      {deleted.size > 0 && (
        <Menu
          style={{
            position: 'sticky',
            padding: config.space.S200,
            paddingLeft: config.space.S400,
            bottom: config.space.S400,
            left: config.space.S400,
            right: 0,
            zIndex: 1,
          }}
          variant="Critical"
        >
          <Box alignItems="Center" gap="400">
            <Box grow="Yes" direction="Column">
              {deleteError ? (
                <Text size="T200">
                  <b>Failed to logout devices! Please try again. {deleteError.message}</b>
                </Text>
              ) : (
                <Text size="T200">
                  <b>Logout from selected devices. ({deleted.size} selected)</b>
                </Text>
              )}
              {authData && (
                <ActionUIAFlowsLoader
                  authData={authData}
                  unsupported={() => (
                    <Text size="T200">
                      Authentication steps to perform this action are not supported by client.
                    </Text>
                  )}
                >
                  {(ongoingFlow) => (
                    <ActionUIA
                      authData={authData}
                      ongoingFlow={ongoingFlow}
                      action={deleteDevices}
                      onCancel={handleCancelAuth}
                    />
                  )}
                </ActionUIAFlowsLoader>
              )}
            </Box>
            <Box shrink="No" gap="200">
              <Button
                size="300"
                variant="Critical"
                fill="None"
                radii="300"
                disabled={deleting}
                onClick={handleCancelDelete}
              >
                <Text size="B300">Cancel</Text>
              </Button>
              <Button
                size="300"
                variant="Critical"
                radii="300"
                disabled={deleting}
                before={deleting && <Spinner variant="Critical" fill="Solid" size="100" />}
                onClick={() => deleteDevices()}
              >
                <Text size="B300">Logout</Text>
              </Button>
            </Box>
          </Box>
        </Menu>
      )}
    </>
  ) : null;
}
