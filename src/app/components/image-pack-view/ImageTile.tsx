import React, { useCallback } from 'react';
import { Badge, Box, Chip, Text } from 'folds';
import { useUsageStr } from './UsageSwitcher';
import { mxcUrlToHttp } from '../../utils/matrix';
import * as css from './style.css';
import { ImageUsage, PackImageReader } from '../../plugins/custom-emoji';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { SettingTile } from '../setting-tile';

type ImageTileProps = {
  useAuthentication: boolean;
  packUsage: ImageUsage[];
  image: PackImageReader;
  canEdit?: boolean;
};
export function ImageTile({ image, packUsage, useAuthentication, canEdit }: ImageTileProps) {
  const mx = useMatrixClient();
  const getUsageStr = useUsageStr();

  const handleChange = useCallback((usg: ImageUsage[]) => {
    console.log(usg);
  }, []);

  return (
    <SettingTile
      before={
        <img
          className={css.ImagePackImage}
          src={mxcUrlToHttp(mx, image.url, useAuthentication) ?? ''}
          alt={image.shortcode}
        />
      }
      title={image.shortcode}
      description={image.body}
      after={
        canEdit ? (
          <Box shrink="No" alignItems="Center" gap="200">
            <Chip variant="Secondary" radii="Pill" outlined>
              <Text size="B300">Edit</Text>
            </Chip>
          </Box>
        ) : undefined
      }
    >
      {image.usage && getUsageStr(image.usage) !== getUsageStr(packUsage) && (
        <Box>
          <Badge variant="Secondary" size="400" radii="300" outlined>
            <Text size="L400">{getUsageStr(image.usage)}</Text>
          </Badge>
        </Box>
      )}
    </SettingTile>
  );
}
