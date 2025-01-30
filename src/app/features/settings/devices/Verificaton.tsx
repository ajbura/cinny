import React, { useState } from 'react';
import { Badge, Box, Button, config, Spinner, Text } from 'folds';
import { SettingTile } from '../../../components/setting-tile';
import * as css from './style.css';
import { VerificationStatus } from '../../../hooks/useDeviceVerificationStatus';

type VerificationStatusBadgeProps = {
  verificationStatus: VerificationStatus;
  otherUnverifiedCount?: number;
};
export function VerificationStatusBadge({
  verificationStatus,
  otherUnverifiedCount,
}: VerificationStatusBadgeProps) {
  if (verificationStatus === VerificationStatus.Unknown || !otherUnverifiedCount) {
    return <Spinner size="400" variant="Secondary" />;
  }
  if (verificationStatus === VerificationStatus.Unverified) {
    return (
      <Badge variant="Critical" fill="Solid" size="500">
        <Text size="L400">Unverified</Text>
      </Badge>
    );
  }

  if (otherUnverifiedCount > 0) {
    return (
      <Badge variant="Critical" fill="Solid" size="500">
        <Text size="L400">{otherUnverifiedCount} Unverified</Text>
      </Badge>
    );
  }

  return (
    <Badge variant="Success" fill="Solid" size="500">
      <Text size="L400">Verified</Text>
    </Badge>
  );
}

function LearnStartVerificationFromOtherDevice() {
  return (
    <Box direction="Column">
      <br />
      <Text size="T200">Steps to start verification from other device.</Text>
      <Text as="div" size="T200">
        <ul style={{ margin: `${config.space.S100} 0` }}>
          <li>Open your other verified device.</li>
          <li>
            Open <i>&quot;Settings&quot;</i>.
          </li>
          <li>
            Open <i>&quot;Devices/Sessions&quot;</i> section.
          </li>
          <li>Find this device to verify.</li>
          <li>
            Click <i>&quot;Start Verification&quot;</i>.
          </li>
          <li>Follow the prompt.</li>
        </ul>
      </Text>
      <Text size="T200">
        If you do not have any verified device press the <i>&quot;Verify Manually&quot;</i> button
        and enter recovery key to recover your device identity and access to encrypted messages.
      </Text>
    </Box>
  );
}

export function ManualVerificationTile() {
  const [learnMore, setLearnMore] = useState(false);

  return (
    <div className={css.UnverifiedCard}>
      <SettingTile
        after={
          <Button size="300" variant="Critical" fill="Soft" radii="300">
            <Text size="B300">Verify Manually</Text>
          </Button>
        }
      >
        <Text size="L400">Unverified</Text>
        <Text size="T200">
          Start verification from other device or verify manually with recovery key.{' '}
          <Text as="a" size="T200" onClick={() => setLearnMore(!learnMore)}>
            <b>{learnMore ? 'View Less' : 'Learn More'}</b>
          </Text>
        </Text>
      </SettingTile>
      {learnMore && <LearnStartVerificationFromOtherDevice />}
    </div>
  );
}

export function StartVerificationTile() {
  return (
    <div className={css.UnverifiedCard}>
      <SettingTile
        after={
          <Button size="300" variant="Critical" radii="300">
            <Text size="B300">Start Verification</Text>
          </Button>
        }
      >
        <Text size="L400">Unverified</Text>
        <Text size="T200">Verify device identity and grant access to encrypted messages.</Text>
      </SettingTile>
    </div>
  );
}
