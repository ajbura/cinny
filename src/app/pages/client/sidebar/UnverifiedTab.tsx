import React, { useState } from 'react';
import { Badge, color, Icon, Icons, Text } from 'folds';
import {
  SidebarAvatar,
  SidebarItem,
  SidebarItemBadge,
  SidebarItemTooltip,
} from '../../../components/sidebar';
import { useDeviceIds, useDeviceList, useSplitCurrentDevice } from '../../../hooks/useDeviceList';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import * as css from './UnverifiedTab.css';
import {
  useDeviceVerificationStatus,
  useUnverifiedDeviceCount,
  VerificationStatus,
} from '../../../hooks/useDeviceVerificationStatus';
import { useCrossSigningActive } from '../../../hooks/useCrossSigning';
import { Modal500 } from '../../../components/Modal500';
import { Settings, SettingsPages } from '../../../features/settings';

function UnverifiedIndicator() {
  const mx = useMatrixClient();

  const crypto = mx.getCrypto();
  const [devices] = useDeviceList();

  const [currentDevice, otherDevices] = useSplitCurrentDevice(devices);

  const verificationStatus = useDeviceVerificationStatus(
    crypto,
    mx.getSafeUserId(),
    currentDevice?.device_id
  );
  const currentVerified = verificationStatus === VerificationStatus.Verified;

  const otherDevicesId = useDeviceIds(otherDevices);
  const unverifiedDeviceCount = useUnverifiedDeviceCount(
    crypto,
    mx.getSafeUserId(),
    otherDevicesId
  );

  const [settings, setSettings] = useState(false);
  const closeSettings = () => setSettings(false);

  if (currentVerified && unverifiedDeviceCount === 0) {
    return null;
  }

  return (
    <SidebarItem className={css.UnverifiedTab}>
      <SidebarItemTooltip tooltip={currentVerified ? 'Unverified Devices' : 'Unverified Device'}>
        {(triggerRef) => (
          <SidebarAvatar
            className={currentVerified ? css.UnverifiedOtherAvatar : css.UnverifiedAvatar}
            as="button"
            ref={triggerRef}
            outlined
            onClick={() => setSettings(true)}
          >
            <Icon
              style={{ color: currentVerified ? color.Warning.Main : color.Critical.Main }}
              src={Icons.ShieldUser}
            />
          </SidebarAvatar>
        )}
      </SidebarItemTooltip>
      <SidebarItemBadge hasCount>
        {currentVerified && (
          <Badge variant="Warning" size="400" fill="Solid" radii="Pill" outlined={false}>
            <Text as="span" size="L400">
              {unverifiedDeviceCount}
            </Text>
          </Badge>
        )}
      </SidebarItemBadge>
      {settings && (
        <Modal500 requestClose={closeSettings}>
          <Settings initialPage={SettingsPages.DevicesPage} requestClose={closeSettings} />
        </Modal500>
      )}
    </SidebarItem>
  );
}

export function UnverifiedTab() {
  const crossSigningActive = useCrossSigningActive();

  if (!crossSigningActive) return null;

  return <UnverifiedIndicator />;
}
