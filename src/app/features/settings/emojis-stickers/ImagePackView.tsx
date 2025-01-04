import React from 'react';
import { Box, IconButton, Text, Icon, Icons, Scroll, Chip } from 'folds';
import { ImagePack } from '../../../plugins/custom-emoji';
import { Page, PageHeader, PageContent } from '../../../components/page';
import { ImagePackViewer } from '../../../components/image-pack-viewer';

type ImagePackViewProps = {
  imagePack: ImagePack;
  requestClose: () => void;
};
export function ImagePackView({ imagePack, requestClose }: ImagePackViewProps) {
  return (
    <Page>
      <PageHeader outlined={false} balance>
        <Box alignItems="Center" grow="Yes" gap="200">
          <Box alignItems="Inherit" grow="Yes" gap="200">
            <Chip
              size="500"
              radii="Pill"
              onClick={requestClose}
              before={<Icon size="100" src={Icons.ArrowLeft} />}
            >
              <Text size="T300">Emojis & Stickers</Text>
            </Chip>
          </Box>
          <Box shrink="No">
            <IconButton onClick={requestClose} variant="Surface">
              <Icon src={Icons.Cross} />
            </IconButton>
          </Box>
        </Box>
      </PageHeader>
      <Box grow="Yes">
        <Scroll hideTrack visibility="Hover">
          <PageContent>
            <Box direction="Column" gap="700">
              <ImagePackViewer imagePack={imagePack} />
            </Box>
          </PageContent>
        </Scroll>
      </Box>
    </Page>
  );
}
