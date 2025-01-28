import React, { useCallback, useState } from 'react';
import { Box, Text, IconButton, Icon, Icons, Scroll, Button, Spinner, Menu, config } from 'folds';
import { AuthDict, MatrixError } from 'matrix-js-sdk';
import { Page, PageContent, PageHeader } from '../../../components/page';
import { SequenceCard } from '../../../components/sequence-card';
import { SequenceCardStyle } from '../styles.css';
import { SettingTile } from '../../../components/setting-tile';
import { useDeviceList } from '../../../hooks/useDeviceList';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { AsyncState, AsyncStatus, useAsync } from '../../../hooks/useAsyncCallback';
import { ActionUIA, ActionUIAFlowsLoader } from '../../../components/ActionUIA';
import { useUIAMatrixError } from '../../../hooks/useUIAFlows';
import { LocalBackup } from './LocalBackup';
import { DeviceDeleteBtn, DeviceLogoutBtn, DeviceTile, DeviceTilePlaceholder } from './DeviceTile';

function DevicesPlaceholder() {
  return (
    <Box direction="Column" gap="100">
      <DeviceTilePlaceholder />
      <DeviceTilePlaceholder />
    </Box>
  );
}

type DevicesProps = {
  requestClose: () => void;
};
export function Devices({ requestClose }: DevicesProps) {
  const mx = useMatrixClient();
  const [devices, refreshDeviceList] = useDeviceList();
  const currentDeviceId = mx.getDeviceId();
  const currentDevice = currentDeviceId
    ? devices?.find((device) => device.device_id === currentDeviceId)
    : undefined;
  const otherDevices = devices?.filter((device) => device.device_id !== currentDeviceId);

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

  return (
    <Page>
      <PageHeader outlined={false}>
        <Box grow="Yes" gap="200">
          <Box grow="Yes" alignItems="Center" gap="200">
            <Text size="H3" truncate>
              Devices
            </Text>
          </Box>
          <Box shrink="No">
            <IconButton onClick={requestClose} variant="Surface">
              <Icon src={Icons.Cross} />
            </IconButton>
          </Box>
        </Box>
      </PageHeader>
      <Box grow="Yes">
        <Scroll hideTrack visibility="Hover">
          <PageContent>
            <Box direction="Column" gap="700">
              {deleted.size > 0 && (
                <Menu
                  style={{
                    position: 'sticky',
                    padding: config.space.S200,
                    paddingLeft: config.space.S400,
                    top: config.space.S400,
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
                              Authentication steps to perform this action are not supported by
                              client.
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
              <Box direction="Column" gap="100">
                <Text size="L400">Security</Text>
                <SequenceCard
                  className={SequenceCardStyle}
                  variant="SurfaceVariant"
                  direction="Column"
                  gap="400"
                >
                  <SettingTile
                    title="Device Verification"
                    description="To verify your identity and grant access to your encrypted messages on another device."
                    after={
                      <Button size="300" radii="300">
                        <Text as="span" size="B300">
                          Activate
                        </Text>
                      </Button>
                    }
                  />
                </SequenceCard>
              </Box>
              <Box direction="Column" gap="100">
                <Text size="L400">Current</Text>
                {currentDevice ? (
                  <SequenceCard
                    className={SequenceCardStyle}
                    variant={deleted.has(currentDevice.device_id) ? 'Critical' : 'SurfaceVariant'}
                    direction="Column"
                    gap="400"
                  >
                    <DeviceTile
                      device={currentDevice}
                      deleted={deleted.has(currentDevice.device_id)}
                      refreshDeviceList={refreshDeviceList}
                      disabled={deleting}
                      options={<DeviceLogoutBtn />}
                    />
                  </SequenceCard>
                ) : (
                  <DeviceTilePlaceholder />
                )}
              </Box>
              {devices === null && <DevicesPlaceholder />}
              {otherDevices && otherDevices.length > 0 && (
                <Box direction="Column" gap="100">
                  <Text size="L400">Others</Text>
                  {otherDevices
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
                      </SequenceCard>
                    ))}
                </Box>
              )}
              <LocalBackup />
            </Box>
          </PageContent>
        </Scroll>
      </Box>
    </Page>
  );
}
