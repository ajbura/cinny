import React, { useMemo } from 'react';
import { as, Box, Text, config, Avatar, AvatarImage, AvatarFallback, Button } from 'folds';
import Linkify from 'linkify-react';
import { ImagePack } from '../../plugins/custom-emoji';
import { mxcUrlToHttp } from '../../utils/matrix';
import { useMediaAuthentication } from '../../hooks/useMediaAuthentication';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { SequenceCard } from '../sequence-card';
import { nameInitials } from '../../utils/common';
import { BreakWord } from '../../styles/Text.css';
import { LINKIFY_OPTS } from '../../plugins/react-custom-html-parser';
import { ContainerColor } from '../../styles/ContainerColor.css';
import { ImageTile } from './ImageTile';

export type ImagePackViewerProps = {
  imagePack: ImagePack;
  canEdit?: boolean;
};

export const ImagePackViewer = as<'div', ImagePackViewerProps>(
  ({ imagePack, canEdit, ...props }, ref) => {
    const mx = useMatrixClient();
    const useAuthentication = useMediaAuthentication();

    const { meta } = imagePack;
    const images = useMemo(() => Array.from(imagePack.images.collection.values()), [imagePack]);

    const packAvatar = meta.avatar ? mxcUrlToHttp(mx, meta.avatar, useAuthentication) : undefined;

    return (
      <Box grow="Yes" direction="Column" gap="700" {...props} ref={ref}>
        <Box gap="400">
          <Box shrink="No">
            <Avatar size="400" className={ContainerColor({ variant: 'Secondary' })}>
              {packAvatar ? (
                <AvatarImage src={packAvatar} alt={meta.name ?? 'Unknown'} />
              ) : (
                <AvatarFallback>
                  <Text size="H4">{nameInitials(meta.name ?? 'Unknown')}</Text>
                </AvatarFallback>
              )}
            </Avatar>
          </Box>
          <Box grow="Yes" direction="Column" gap="300">
            <Box direction="Column" gap="100">
              <Text className={BreakWord} size="H5">
                {meta.name ?? 'Unknown'}
              </Text>
              {meta.attribution && (
                <Text className={BreakWord} size="T200">
                  <Linkify options={LINKIFY_OPTS}>{meta.attribution}</Linkify>
                </Text>
              )}
            </Box>
          </Box>
          {canEdit && (
            <Box gap="200" wrap="Wrap">
              <Button variant="Secondary" fill="Soft" size="400" radii="300">
                <Text size="B400">Edit</Text>
              </Button>
            </Box>
          )}
        </Box>
        <Box direction="Column" gap="100">
          <Text size="L400">Images</Text>
          <Box direction="Column" gap="100">
            {images.map((image) => (
              <SequenceCard
                key={image.shortcode}
                style={{ padding: config.space.S300 }}
                variant="SurfaceVariant"
                direction="Column"
                gap="400"
              >
                <ImageTile
                  image={image}
                  packUsage={meta.usage}
                  useAuthentication={useAuthentication}
                />
              </SequenceCard>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }
);
