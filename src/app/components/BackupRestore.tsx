import React, { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { CryptoApi } from 'matrix-js-sdk/lib/crypto-api';
import { Badge, Box, Chip, percent, ProgressBar, Spinner, Text } from 'folds';
import { BackupProgressStatus, backupRestoreProgressAtom } from '../state/backupRestore';
import { InfoCard } from './info-card';
import { AsyncStatus, useAsyncCallback } from '../hooks/useAsyncCallback';

type BackupRestoreTileProps = {
  crypto: CryptoApi;
};
export function BackupRestoreTile({ crypto }: BackupRestoreTileProps) {
  const [restoreProgress, setRestoreProgress] = useAtom(backupRestoreProgressAtom);

  const [backupInfo, loadBackupInfo] = useAsyncCallback(
    useCallback(() => crypto.getKeyBackupInfo(), [crypto])
  );

  useEffect(() => {
    loadBackupInfo();
  }, [loadBackupInfo]);

  const [restoreState, restoreBackup] = useAsyncCallback(
    useCallback(async () => {
      await crypto.restoreKeyBackup({
        progressCallback(progress) {
          setRestoreProgress(progress);
        },
      });
    }, [crypto, setRestoreProgress])
  );

  const running =
    restoreState.status === AsyncStatus.Loading ||
    restoreProgress.status === BackupProgressStatus.Fetching ||
    restoreProgress.status === BackupProgressStatus.Loading;

  const hasInfo = backupInfo.status === AsyncStatus.Success;

  return (
    <InfoCard
      variant="Surface"
      title="Encryption Backup"
      description={
        <span>
          Version: {hasInfo ? backupInfo.data?.version : 'NIL'}, Messages Keys:{' '}
          {hasInfo ? backupInfo.data?.count : 'NIL'}
        </span>
      }
      after={
        <Chip
          variant="Secondary"
          radii="Pill"
          onClick={restoreBackup}
          disabled={running}
          before={running && <Spinner size="100" variant="Secondary" fill="Soft" />}
        >
          <Text as="span" size="B300">
            Restore
          </Text>
        </Chip>
      }
    >
      {restoreProgress.status === BackupProgressStatus.Loading && (
        <Box grow="Yes" gap="200" alignItems="Center">
          <Badge variant="Secondary" fill="Solid" radii="Pill">
            <Text size="L400">{`${Math.round(
              percent(0, restoreProgress.data.total, restoreProgress.data.downloaded)
            )}%`}</Text>
          </Badge>
          <Box grow="Yes" direction="Column">
            <ProgressBar
              variant="Secondary"
              size="300"
              min={0}
              max={restoreProgress.data.total}
              value={restoreProgress.data.downloaded}
            />
          </Box>
          <Badge variant="Secondary" fill="Soft" radii="Pill">
            <Text size="L400">
              {restoreProgress.data.downloaded} / {restoreProgress.data.total}
            </Text>
          </Badge>
        </Box>
      )}
    </InfoCard>
  );
}
