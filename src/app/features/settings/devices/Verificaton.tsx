import React from 'react';
import { Button, Text } from 'folds';
import { SettingTile } from '../../../components/setting-tile';
import * as css from './style.css';

export function ManualVerificationTile() {
  return (
    <div className={css.UnverifiedCard}>
      <SettingTile
        after={
          <Button size="300" variant="Warning" fill="Soft" radii="300">
            <Text size="B300">Verify Manually</Text>
          </Button>
        }
      >
        <Text size="L400">Unverified</Text>
        <Text size="T200">
          Start verification from other device or verify manually with recovery key.
        </Text>
      </SettingTile>
    </div>
  );
}

export function StartVerificationTile() {
  return (
    <div className={css.UnverifiedCard}>
      <SettingTile
        after={
          <Button size="300" variant="Warning" radii="300">
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
