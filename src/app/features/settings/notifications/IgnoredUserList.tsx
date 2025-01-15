import React, { ChangeEventHandler, FormEventHandler, useCallback, useMemo, useState } from 'react';
import { Box, Button, Chip, Icon, IconButton, Icons, Input, Spinner, Text, config } from 'folds';
import { useAccountData } from '../../../hooks/useAccountData';
import { AccountDataEvent } from '../../../../types/matrix/accountData';
import { SequenceCard } from '../../../components/sequence-card';
import { SequenceCardStyle } from '../styles.css';
import { SettingTile } from '../../../components/setting-tile';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { AsyncStatus, useAsyncCallback } from '../../../hooks/useAsyncCallback';
import { isUserId } from '../../../utils/matrix';

type IgnoredUserListContent = {
  ignored_users?: Record<string, object>;
};

function IgnoreUserInput({ userList }: { userList: string[] }) {
  const mx = useMatrixClient();
  const [userId, setUserId] = useState<string>('');

  const [ignoreState, ignore] = useAsyncCallback(
    useCallback(
      async (uId: string) => {
        mx.setIgnoredUsers([...userList, uId]);
        setUserId('');
      },
      [mx, userList]
    )
  );
  const ignoring = ignoreState.status === AsyncStatus.Loading;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (evt) => {
    const uId = evt.currentTarget.value;
    setUserId(uId);
  };

  const handleReset = () => {
    setUserId('');
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();
    if (ignoring) return;

    const target = evt.target as HTMLFormElement | undefined;
    const userIdInput = target?.userIdInput as HTMLInputElement | undefined;
    const uId = userIdInput?.value.trim();
    if (!uId) return;

    if (!isUserId(uId)) return;

    ignore(uId);
  };

  return (
    <Box as="form" onSubmit={handleSubmit} gap="200" aria-disabled={ignoring}>
      <Box grow="Yes" direction="Column">
        <Input
          required
          name="userIdInput"
          value={userId}
          onChange={handleChange}
          variant="Secondary"
          radii="300"
          style={{ paddingRight: config.space.S200 }}
          readOnly={ignoring}
          after={
            userId &&
            !ignoring && (
              <IconButton
                type="reset"
                onClick={handleReset}
                size="300"
                radii="300"
                variant="Secondary"
              >
                <Icon src={Icons.Cross} size="100" />
              </IconButton>
            )
          }
        />
      </Box>
      <Button
        size="400"
        variant="Secondary"
        fill="Soft"
        outlined
        radii="300"
        type="submit"
        disabled={ignoring}
      >
        {ignoring && <Spinner variant="Secondary" size="300" />}
        <Text size="B400">Block</Text>
      </Button>
    </Box>
  );
}

function IgnoredUserChip({ userId, userList }: { userId: string; userList: string[] }) {
  const mx = useMatrixClient();
  const [unignoreState, unignore] = useAsyncCallback(
    useCallback(
      () => mx.setIgnoredUsers(userList.filter((uId) => uId !== userId)),
      [mx, userId, userList]
    )
  );

  const handleUnignore = () => unignore();

  const unIgnoring = unignoreState.status === AsyncStatus.Loading;
  return (
    <Chip
      variant="Secondary"
      radii="Pill"
      after={
        unIgnoring ? (
          <Spinner variant="Secondary" size="100" />
        ) : (
          <Icon src={Icons.Cross} size="100" />
        )
      }
      onClick={handleUnignore}
      disabled={unIgnoring}
    >
      <Text size="T200" truncate>
        {userId}
      </Text>
    </Chip>
  );
}

export function IgnoredUserList() {
  const ignoredUserListEvt = useAccountData(AccountDataEvent.IgnoredUserList);
  const ignoredUsers = useMemo(() => {
    const ignoredUsersRecord =
      ignoredUserListEvt?.getContent<IgnoredUserListContent>().ignored_users ?? {};
    return Object.keys(ignoredUsersRecord);
  }, [ignoredUserListEvt]);

  return (
    <Box direction="Column" gap="100">
      <Box alignItems="Center" justifyContent="SpaceBetween" gap="200">
        <Text size="L400">Block Messages</Text>
      </Box>
      <SequenceCard
        className={SequenceCardStyle}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      >
        <SettingTile
          title="Select User"
          description="Prevent receiving message by adding userId into blocklist."
        >
          <Box direction="Column" gap="300">
            <IgnoreUserInput userList={ignoredUsers} />
            {ignoredUsers.length > 0 && (
              <Box direction="Inherit" gap="100">
                <Text size="L400">Blocklist</Text>
                <Box wrap="Wrap" gap="200">
                  {ignoredUsers.map((userId) => (
                    <IgnoredUserChip key={userId} userId={userId} userList={ignoredUsers} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </SettingTile>
      </SequenceCard>
    </Box>
  );
}
