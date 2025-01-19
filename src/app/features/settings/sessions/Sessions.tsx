import React, { FormEventHandler, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Text,
  IconButton,
  Icon,
  Icons,
  Scroll,
  Chip,
  Input,
  Button,
  color,
  Spinner,
  toRem,
  Menu,
  config,
} from 'folds';
import { AuthDict, IMyDevice, MatrixError } from 'matrix-js-sdk';
import { Page, PageContent, PageHeader } from '../../../components/page';
import { SequenceCard } from '../../../components/sequence-card';
import { SequenceCardStyle } from '../styles.css';
import { SettingTile } from '../../../components/setting-tile';
import { useDeviceList } from '../../../hooks/useDeviceList';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { timeDayMonYear, timeHourMinute, today, yesterday } from '../../../utils/time';
import { BreakWord } from '../../../styles/Text.css';
import {
  AsyncState,
  AsyncStatus,
  useAsync,
  useAsyncCallback,
} from '../../../hooks/useAsyncCallback';
import { ActionUIA, ActionUIAFlowsLoader } from '../../../components/ActionUIA';
import { useUIAMatrixError } from '../../../hooks/useUIAFlows';

function DevicesPlaceholder() {
  return (
    <Box direction="Column" gap="100">
      <SequenceCard
        className={SequenceCardStyle}
        style={{ height: toRem(64) }}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      />
      <SequenceCard
        className={SequenceCardStyle}
        style={{ height: toRem(64) }}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      />
      <SequenceCard
        className={SequenceCardStyle}
        style={{ height: toRem(64) }}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      />
      <SequenceCard
        className={SequenceCardStyle}
        style={{ height: toRem(64) }}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      />
      <SequenceCard
        className={SequenceCardStyle}
        style={{ height: toRem(64) }}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      />
    </Box>
  );
}

function DeviceActiveTime({ ts }: { ts: number }) {
  return (
    <Text className={BreakWord} size="T200">
      <Text size="Inherit" as="span" priority="300">
        {'Last activity: '}
      </Text>
      <>
        {today(ts) && 'Today'}
        {yesterday(ts) && 'Yesterday'}
        {!today(ts) && !yesterday(ts) && timeDayMonYear(ts)} {timeHourMinute(ts)}
      </>
    </Text>
  );
}

function DeviceDetails({ device }: { device: IMyDevice }) {
  return (
    <>
      {typeof device.device_id === 'string' && (
        <Text className={BreakWord} size="T200" priority="300">
          Session ID: <i>{device.device_id}</i>
        </Text>
      )}
      {typeof device.last_seen_ip === 'string' && (
        <Text className={BreakWord} size="T200" priority="300">
          IP Address: <i>{device.last_seen_ip}</i>
        </Text>
      )}
    </>
  );
}

type DeviceRenameProps = {
  device: IMyDevice;
  onCancel: () => void;
  onRename: () => void;
  refreshDeviceList: () => Promise<void>;
};
function DeviceRename({ device, onCancel, onRename, refreshDeviceList }: DeviceRenameProps) {
  const mx = useMatrixClient();

  const [renameState, rename] = useAsyncCallback<void, MatrixError, [string]>(
    useCallback(
      async (name: string) => {
        await mx.setDeviceDetails(device.device_id, { display_name: name });
        await refreshDeviceList();
      },
      [mx, device.device_id, refreshDeviceList]
    )
  );

  const renaming = renameState.status === AsyncStatus.Loading;

  useEffect(() => {
    if (renameState.status === AsyncStatus.Success) {
      onRename();
    }
  }, [renameState, onRename]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();
    if (renaming) return;

    const target = evt.target as HTMLFormElement | undefined;
    const nameInput = target?.nameInput as HTMLInputElement | undefined;
    if (!nameInput) return;
    const sessionName = nameInput.value.trim();
    if (!sessionName || sessionName === device.display_name) return;

    rename(sessionName);
  };

  return (
    <Box as="form" onSubmit={handleSubmit} direction="Column" gap="100">
      <Text size="L400">Session Name</Text>
      <Box gap="200">
        <Box grow="Yes" direction="Column">
          <Input
            name="nameInput"
            size="300"
            variant="Secondary"
            radii="300"
            defaultValue={device.display_name}
            autoFocus
            required
            readOnly={renaming}
          />
        </Box>
        <Box shrink="No" gap="200">
          <Button
            type="submit"
            size="300"
            variant="Success"
            radii="300"
            fill="Solid"
            disabled={renaming}
            before={renaming && <Spinner size="100" variant="Success" fill="Solid" />}
          >
            <Text size="B300">Save</Text>
          </Button>
          <Button
            type="button"
            size="300"
            variant="Secondary"
            radii="300"
            fill="Soft"
            onClick={onCancel}
            disabled={renaming}
          >
            <Text size="B300">Cancel</Text>
          </Button>
        </Box>
      </Box>
      {renameState.status === AsyncStatus.Error ? (
        <Text size="T200" style={{ color: color.Critical.Main }}>
          {renameState.error.message}
        </Text>
      ) : (
        <Text size="T200">Session names are visible to public.</Text>
      )}
    </Box>
  );
}

type DeviceTileProps = {
  device: IMyDevice;
  deleted: boolean;
  onDeleteToggle: (deviceId: string) => void;
  refreshDeviceList: () => Promise<void>;
  disabled?: boolean;
};
function DeviceTile({
  device,
  deleted,
  onDeleteToggle,
  refreshDeviceList,
  disabled,
}: DeviceTileProps) {
  const activeTs = device.last_seen_ts;
  const [details, setDetails] = useState(false);
  const [edit, setEdit] = useState(false);

  const handleRename = useCallback(() => {
    setEdit(false);
  }, []);

  return (
    <>
      <SettingTile
        before={
          <IconButton
            variant={deleted ? 'Critical' : 'Secondary'}
            outlined={deleted}
            radii="300"
            onClick={() => setDetails(!details)}
          >
            <Icon size="50" src={details ? Icons.ChevronBottom : Icons.ChevronRight} />
          </IconButton>
        }
        after={
          !edit && (
            <Box shrink="No" alignItems="Center" gap="200">
              {deleted ? (
                <Chip
                  variant="Critical"
                  fill="None"
                  radii="Pill"
                  onClick={() => onDeleteToggle?.(device.device_id)}
                  disabled={disabled}
                >
                  <Text size="B300">Undo</Text>
                </Chip>
              ) : (
                <>
                  <Chip
                    variant="Secondary"
                    fill="None"
                    radii="Pill"
                    onClick={() => onDeleteToggle?.(device.device_id)}
                    disabled={disabled}
                  >
                    <Icon size="50" src={Icons.Delete} />
                  </Chip>
                  <Chip
                    variant="Secondary"
                    radii="Pill"
                    onClick={() => setEdit(true)}
                    disabled={disabled}
                  >
                    <Text size="B300">Edit</Text>
                  </Chip>
                </>
              )}
            </Box>
          )
        }
      >
        <Text size="T300">{device.display_name ?? device.device_id}</Text>
        <Box direction="Column">
          {typeof activeTs === 'number' && <DeviceActiveTime ts={activeTs} />}
          {details && <DeviceDetails device={device} />}
        </Box>
      </SettingTile>
      {edit && (
        <DeviceRename
          device={device}
          onCancel={() => setEdit(false)}
          onRename={handleRename}
          refreshDeviceList={refreshDeviceList}
        />
      )}
    </>
  );
}

type SessionsProps = {
  requestClose: () => void;
};
export function Sessions({ requestClose }: SessionsProps) {
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
              Sessions
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
                          <b>Failed to logout sessions! Please try again. {deleteError.message}</b>
                        </Text>
                      ) : (
                        <Text size="T200">
                          <b>Logout from selected sessions. ({deleted.size} selected)</b>
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
                              userId={mx.getUserId()!}
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
              {devices === null && <DevicesPlaceholder />}
              {currentDevice && (
                <Box direction="Column" gap="100">
                  <Text size="L400">Current</Text>
                  <SequenceCard
                    className={SequenceCardStyle}
                    variant={deleted.has(currentDevice.device_id) ? 'Critical' : 'SurfaceVariant'}
                    direction="Column"
                    gap="400"
                  >
                    <DeviceTile
                      device={currentDevice}
                      deleted={deleted.has(currentDevice.device_id)}
                      onDeleteToggle={handleToggleDelete}
                      refreshDeviceList={refreshDeviceList}
                      disabled={deleting}
                    />
                  </SequenceCard>
                </Box>
              )}
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
                          onDeleteToggle={handleToggleDelete}
                          refreshDeviceList={refreshDeviceList}
                          disabled={deleting}
                        />
                      </SequenceCard>
                    ))}
                </Box>
              )}
            </Box>
          </PageContent>
        </Scroll>
      </Box>
    </Page>
  );
}
