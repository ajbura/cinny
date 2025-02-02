import React, { useState } from 'react';
import { Badge, Box, Button, Chip, config, Icon, Icons, Spinner, Text } from 'folds';
import { VerificationStatus } from '../../../hooks/useDeviceVerificationStatus';
import { InfoCard } from '../../../components/info-card';
import { ManualVerificationTile } from '../../../components/ManualVerification';
import { SecretStorageKeyContent } from '../../../../types/matrix/accountData';

type VerificationStatusBadgeProps = {
  verificationStatus: VerificationStatus;
  otherUnverifiedCount?: number;
};
export function VerificationStatusBadge({
  verificationStatus,
  otherUnverifiedCount,
}: VerificationStatusBadgeProps) {
  if (
    verificationStatus === VerificationStatus.Unknown ||
    typeof otherUnverifiedCount !== 'number'
  ) {
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
      <Badge variant="Warning" fill="Solid" size="500">
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
      <Text size="T200">Steps to verify from other device.</Text>
      <Text as="div" size="T200">
        <ul style={{ margin: `${config.space.S100} 0` }}>
          <li>Open your other verified device.</li>
          <li>
            Open <i>Settings</i>.
          </li>
          <li>
            Find this device in <i>Devices/Sessions</i> section.
          </li>
          <li>Initiate verification.</li>
        </ul>
      </Text>
      <Text size="T200">
        If you do not have any verified device press the <i>&quot;Verify Manually&quot;</i> button.
      </Text>
    </Box>
  );
}

type VerifyCurrentDeviceTileProps = {
  secretStorageKeyId: string;
  secretStorageKeyContent: SecretStorageKeyContent;
};
export function VerifyCurrentDeviceTile({
  secretStorageKeyId,
  secretStorageKeyContent,
}: VerifyCurrentDeviceTileProps) {
  const [learnMore, setLearnMore] = useState(false);

  const [manualVerification, setManualVerification] = useState(false);
  const handleCancelVerification = () => setManualVerification(false);

  return (
    <>
      <InfoCard
        variant="Critical"
        title="Unverified"
        description={
          <>
            Start verification from other device or verify manually.{' '}
            <Text as="a" size="T200" onClick={() => setLearnMore(!learnMore)}>
              <b>{learnMore ? 'View Less' : 'Learn More'}</b>
            </Text>
          </>
        }
        after={
          !manualVerification && (
            <Button
              size="300"
              variant="Critical"
              fill="Soft"
              radii="300"
              outlined
              onClick={() => setManualVerification(true)}
            >
              <Text as="span" size="B300">
                Verify Manually
              </Text>
            </Button>
          )
        }
      >
        {learnMore && <LearnStartVerificationFromOtherDevice />}
      </InfoCard>
      {manualVerification && (
        <ManualVerificationTile
          secretStorageKeyId={secretStorageKeyId}
          secretStorageKeyContent={secretStorageKeyContent}
          options={
            <Chip
              type="button"
              variant="Secondary"
              fill="Soft"
              radii="Pill"
              onClick={handleCancelVerification}
            >
              <Icon size="100" src={Icons.Cross} />
            </Chip>
          }
        />
      )}
    </>
  );
}

export function VerifyOtherDeviceTile() {
  return (
    <InfoCard
      variant="Warning"
      title="Unverified"
      description="Verify device identity and grant access to encrypted messages."
      after={
        <Button size="300" variant="Warning" radii="300">
          <Text size="B300">Verify</Text>
        </Button>
      }
    />
  );
}
