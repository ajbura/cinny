import React from 'react';
import { Avatar, AvatarFallback, AvatarImage, Box, Button, Icon, Icons, Text } from 'folds';
import { useUserImagePack } from '../../../hooks/useImagePacks';
import { SequenceCard } from '../../../components/sequence-card';
import { SequenceCardStyle } from '../styles.css';
import { SettingTile } from '../../../components/setting-tile';
import { ImageUsage } from '../../../plugins/custom-emoji';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { mxcUrlToHttp } from '../../../utils/matrix';
import { useMediaAuthentication } from '../../../hooks/useMediaAuthentication';

export function UserPack() {
  const mx = useMatrixClient();
  const useAuthentication = useMediaAuthentication();

  const userPack = useUserImagePack();
  const avatarMxc = userPack?.getAvatarUrl(ImageUsage.Emoticon);
  const avatarUrl = avatarMxc ? mxcUrlToHttp(mx, avatarMxc, useAuthentication) : undefined;

  return (
    <Box direction="Column" gap="100">
      <Text size="L400">Personal Pack</Text>
      <SequenceCard
        className={SequenceCardStyle}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      >
        <SettingTile
          title={userPack?.meta.name ?? 'Default'}
          description={userPack?.meta.attribution}
          before={
            <Avatar size="300" radii="300">
              {avatarUrl ? (
                <AvatarImage style={{ objectFit: 'contain' }} src={avatarUrl} />
              ) : (
                <AvatarFallback>
                  <Icon size="400" src={Icons.Sticker} filled />
                </AvatarFallback>
              )}
            </Avatar>
          }
          after={
            <Button variant="Secondary" fill="Soft" size="300" radii="300" outlined>
              <Text size="B300">View</Text>
            </Button>
          }
        />
      </SequenceCard>
    </Box>
  );
}
