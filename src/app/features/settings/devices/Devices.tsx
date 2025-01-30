import React, { useMemo } from 'react';
import { Box, Text, IconButton, Icon, Icons, Scroll, Button } from 'folds';
import { Page, PageContent, PageHeader } from '../../../components/page';
import { SequenceCard } from '../../../components/sequence-card';
import { SequenceCardStyle } from '../styles.css';
import { SettingTile } from '../../../components/setting-tile';
import { useDeviceList } from '../../../hooks/useDeviceList';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { LocalBackup } from './LocalBackup';
import { DeviceLogoutBtn, DeviceTile, DeviceTilePlaceholder } from './DeviceTile';
import { OtherDevices } from './OtherDevices';
import { ManualVerificationTile, VerificationStatusBadge } from './Verificaton';
import {
  useDeviceVerificationStatus,
  useUnverifiedDeviceCount,
  VerificationStatus,
} from '../../../hooks/useDeviceVerificationStatus';

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
  const crypto = mx.getCrypto();
  const [devices, refreshDeviceList] = useDeviceList();
  const currentDeviceId = mx.getDeviceId();
  const currentDevice = currentDeviceId
    ? devices?.find((device) => device.device_id === currentDeviceId)
    : undefined;
  const otherDevices = devices?.filter((device) => device.device_id !== currentDeviceId);

  const verificationStatus = useDeviceVerificationStatus(
    crypto,
    mx.getSafeUserId(),
    currentDevice?.device_id
  );

  const otherDevicesId = useMemo(
    () => otherDevices?.map((device) => device.device_id) ?? [],
    [otherDevices]
  );
  const unverifiedDeviceCount = useUnverifiedDeviceCount(
    crypto,
    mx.getSafeUserId(),
    otherDevicesId
  );

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
                      true ? (
                        <VerificationStatusBadge
                          verificationStatus={verificationStatus}
                          otherUnverifiedCount={unverifiedDeviceCount}
                        />
                      ) : (
                        <Button size="300" radii="300">
                          <Text as="span" size="B300">
                            Activate
                          </Text>
                        </Button>
                      )
                    }
                  />
                </SequenceCard>
              </Box>
              <Box direction="Column" gap="100">
                <Text size="L400">Current</Text>
                {currentDevice ? (
                  <SequenceCard
                    className={SequenceCardStyle}
                    variant="SurfaceVariant"
                    direction="Column"
                    gap="400"
                  >
                    <DeviceTile
                      device={currentDevice}
                      refreshDeviceList={refreshDeviceList}
                      options={<DeviceLogoutBtn />}
                    />
                    {verificationStatus === VerificationStatus.Unverified && (
                      <ManualVerificationTile />
                    )}
                  </SequenceCard>
                ) : (
                  <DeviceTilePlaceholder />
                )}
              </Box>
              {devices === null && <DevicesPlaceholder />}
              {otherDevices && (
                <OtherDevices
                  devices={otherDevices}
                  refreshDeviceList={refreshDeviceList}
                  showVerification={verificationStatus === VerificationStatus.Verified}
                />
              )}
              <LocalBackup />
            </Box>
          </PageContent>
        </Scroll>
      </Box>
    </Page>
  );
}
