import React from 'react';
import {
  Box,
  Text,
  Button,
  Icon,
  Icons,
  IconButton,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from 'folds';
import { useGlobalImagePacks } from '../../../hooks/useImagePacks';
import { SequenceCardStyle } from '../styles.css';
import { SequenceCard } from '../../../components/sequence-card';
import { SettingTile } from '../../../components/setting-tile';
import { mxcUrlToHttp } from '../../../utils/matrix';
import { useMediaAuthentication } from '../../../hooks/useMediaAuthentication';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { ImagePack, ImageUsage } from '../../../plugins/custom-emoji';
import { LineClamp2 } from '../../../styles/Text.css';

type GlobalPacksProps = {
  onViewPack: (imagePack: ImagePack) => void;
};
export function GlobalPacks({ onViewPack }: GlobalPacksProps) {
  const mx = useMatrixClient();
  const useAuthentication = useMediaAuthentication();
  const globalPacks = useGlobalImagePacks();

  return (
    <Box direction="Column" gap="100">
      <Text size="L400">Favorite Packs</Text>
      <SequenceCard
        className={SequenceCardStyle}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      >
        <SettingTile
          title="Select Pack"
          description="Pick emojis and stickers pack from rooms to use in all rooms."
          after={
            <Button variant="Secondary" fill="Soft" size="300" radii="300" outlined>
              <Text size="B300">Select</Text>
            </Button>
          }
        />
      </SequenceCard>
      {globalPacks.map((pack) => {
        const avatarMxc = pack.getAvatarUrl(ImageUsage.Emoticon);
        const avatarUrl = avatarMxc ? mxcUrlToHttp(mx, avatarMxc, useAuthentication) : undefined;

        return (
          <SequenceCard
            key={pack.id}
            className={SequenceCardStyle}
            variant="SurfaceVariant"
            direction="Column"
            gap="400"
          >
            <SettingTile
              title={pack.meta.name ?? 'Unknown'}
              description={<span className={LineClamp2}>{pack.meta.attribution}</span>}
              before={
                <Box alignItems="Center" gap="300">
                  <IconButton size="300" radii="Pill" variant="Secondary">
                    <Icon src={Icons.Cross} size="100" />
                  </IconButton>
                  <Avatar size="300" radii="300">
                    {avatarUrl ? (
                      <AvatarImage style={{ objectFit: 'contain' }} src={avatarUrl} />
                    ) : (
                      <AvatarFallback>
                        <Icon size="400" src={Icons.Sticker} filled />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Box>
              }
              after={
                <Button
                  variant="Secondary"
                  fill="Soft"
                  size="300"
                  radii="300"
                  outlined
                  onClick={() => onViewPack(pack)}
                >
                  <Text size="B300">View</Text>
                </Button>
              }
            />
          </SequenceCard>
        );
      })}
    </Box>
  );
}
