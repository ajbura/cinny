import React, { FormEventHandler, useCallback, useEffect, useState } from 'react';
import { Box, Text, IconButton, Icon, Icons, Chip, Input, Button, color, Spinner } from 'folds';
import { IMyDevice, MatrixError } from 'matrix-js-sdk';
import { SettingTile } from '../../../components/setting-tile';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { timeDayMonYear, timeHourMinute, today, yesterday } from '../../../utils/time';
import { BreakWord } from '../../../styles/Text.css';
import { AsyncStatus, useAsyncCallback } from '../../../hooks/useAsyncCallback';

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
          Device ID: <i>{device.device_id}</i>
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
    const deviceName = nameInput.value.trim();
    if (!deviceName || deviceName === device.display_name) return;

    rename(deviceName);
  };

  return (
    <Box as="form" onSubmit={handleSubmit} direction="Column" gap="100">
      <Text size="L400">Device Name</Text>
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
        <Text size="T200">Device names are visible to public.</Text>
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
export function DeviceTile({
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
