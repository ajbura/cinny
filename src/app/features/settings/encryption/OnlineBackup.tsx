import React from 'react';
import { Box, Text, Button } from 'folds';
import { SettingTile } from '../../../components/setting-tile';
import { SequenceCard } from '../../../components/sequence-card';
import { SequenceCardStyle } from '../styles.css';

export function OnlineBackup() {
  return (
    <Box direction="Column" gap="100">
      <Text size="L400">Online Backup</Text>
      <SequenceCard
        className={SequenceCardStyle}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      >
        <SettingTile
          title="Automatic Backup"
          description="Continuously save encryption data on server to decrypt messages later."
          after={
            <Button size="300" variant="Success" radii="300">
              <Text as="span" size="B300">
                Restore
              </Text>
            </Button>
          }
        />
      </SequenceCard>
    </Box>
  );
}
