import React, { useCallback, useMemo, useState } from 'react';
import { as, Box, Text, config, Button, Menu } from 'folds';
import {
  ImagePack,
  ImageUsage,
  PackImageReader,
  packMetaEqual,
  PackMetaReader,
} from '../../plugins/custom-emoji';
import { useMediaAuthentication } from '../../hooks/useMediaAuthentication';
import { SequenceCard } from '../sequence-card';
import { ImageTile, ImageTileEdit } from './ImageTile';
import { SettingTile } from '../setting-tile';
import { UsageSwitcher } from './UsageSwitcher';
import { ImagePackProfile, ImagePackProfileEdit } from './PackMeta';
import * as css from './style.css';

export type ImagePackContentProps = {
  imagePack: ImagePack;
  canEdit?: boolean;
};

export const ImagePackContent = as<'div', ImagePackContentProps>(
  ({ imagePack, canEdit, ...props }, ref) => {
    const useAuthentication = useMediaAuthentication();
    const images = useMemo(() => Array.from(imagePack.images.collection.values()), [imagePack]);

    const [metaEditing, setMetaEditing] = useState(false);
    const [savedMeta, setSavedMeta] = useState<PackMetaReader>();
    const currentMeta = savedMeta ?? imagePack.meta;

    const [imagesEditing, setImagesEditing] = useState<Set<string>>(new Set());
    const [savedImages, setSavedImages] = useState<Map<string, PackImageReader>>(new Map());
    const [deleteImages, setDeleteImages] = useState<Set<string>>(new Set());

    const handleMetaSave = useCallback(
      (editedMeta: PackMetaReader) => {
        setMetaEditing(false);
        setSavedMeta(
          (m) =>
            new PackMetaReader({
              ...imagePack.meta.content,
              ...m?.content,
              ...editedMeta.content,
            })
        );
      },
      [imagePack.meta]
    );

    const handleMetaCancel = () => setMetaEditing(false);

    const handlePackUsageChange = useCallback(
      (usg: ImageUsage[]) => {
        setSavedMeta(
          (m) =>
            new PackMetaReader({
              ...imagePack.meta.content,
              ...m?.content,
              usage: usg,
            })
        );
      },
      [imagePack.meta]
    );

    const handleImageEdit = (shortcode: string) => {
      setImagesEditing((shortcodes) => {
        const shortcodeSet = new Set(shortcodes);
        shortcodeSet.add(shortcode);
        return shortcodeSet;
      });
    };
    const handleDeleteToggle = (shortcode: string) => {
      setDeleteImages((shortcodes) => {
        const shortcodeSet = new Set(shortcodes);
        if (shortcodeSet.has(shortcode)) shortcodeSet.delete(shortcode);
        else shortcodeSet.add(shortcode);
        return shortcodeSet;
      });
    };

    const handleImageEditCancel = (shortcode: string) => {
      setImagesEditing((shortcodes) => {
        const shortcodeSet = new Set(shortcodes);
        shortcodeSet.delete(shortcode);
        return shortcodeSet;
      });
    };

    const handleImageEditSave = (shortcode: string, image: PackImageReader) => {
      handleImageEditCancel(shortcode);
      setSavedImages((sImgs) => {
        const imgs = new Map(sImgs);
        imgs.set(shortcode, image);
        return imgs;
      });
    };

    const handleResetSavedChanges = () => {
      setSavedMeta(undefined);
      setSavedImages(new Map());
      setDeleteImages(new Set());
    };
    const handleApplySavedChanges = () => {
      setSavedMeta(undefined);
    };

    const savedChanges =
      (savedMeta && !packMetaEqual(imagePack.meta, savedMeta)) ||
      savedImages.size > 0 ||
      deleteImages.size > 0;
    const canApplyChanges = !metaEditing && imagesEditing.size === 0;

    return (
      <Box grow="Yes" direction="Column" gap="700" {...props} ref={ref}>
        {savedChanges && (
          <Menu className={css.UnsavedMenu} variant="Success">
            <Box alignItems="Center" gap="400">
              <Box grow="Yes" direction="Column">
                <Text size="T200">
                  <b>Changes saved! Apply when ready.</b>
                </Text>
              </Box>
              <Box shrink="No" gap="200">
                <Button
                  size="300"
                  variant="Success"
                  fill="None"
                  radii="300"
                  disabled={!canApplyChanges}
                  onClick={handleResetSavedChanges}
                >
                  <Text size="B300">Reset</Text>
                </Button>
                <Button
                  size="300"
                  variant="Success"
                  radii="300"
                  disabled={!canApplyChanges}
                  onClick={handleApplySavedChanges}
                >
                  <Text size="B300">Apply Changes</Text>
                </Button>
              </Box>
            </Box>
          </Menu>
        )}
        <Box direction="Column" gap="100">
          <Text size="L400">Pack</Text>
          <SequenceCard
            style={{ padding: config.space.S300 }}
            variant="SurfaceVariant"
            direction="Column"
            gap="400"
          >
            {metaEditing ? (
              <ImagePackProfileEdit
                meta={currentMeta}
                onCancel={handleMetaCancel}
                onSave={handleMetaSave}
              />
            ) : (
              <ImagePackProfile
                meta={currentMeta}
                canEdit={canEdit}
                onEdit={() => setMetaEditing(true)}
              />
            )}
          </SequenceCard>
          <SequenceCard
            style={{ padding: config.space.S300 }}
            variant="SurfaceVariant"
            direction="Column"
            gap="400"
          >
            <SettingTile
              title="Images Usage"
              description="Select how the images are being used: as emojis, as stickers, or as both."
              after={
                <UsageSwitcher
                  usage={currentMeta.usage}
                  canEdit={canEdit}
                  onChange={handlePackUsageChange}
                />
              }
            />
          </SequenceCard>
        </Box>
        {images.length > 0 && (
          <Box direction="Column" gap="100">
            <Text size="L400">Images</Text>
            <Box direction="Column" gap="100">
              {images.map((image) => (
                <SequenceCard
                  key={image.shortcode}
                  style={{ padding: config.space.S300 }}
                  variant={deleteImages.has(image.shortcode) ? 'Critical' : 'SurfaceVariant'}
                  direction="Column"
                  gap="400"
                >
                  {imagesEditing.has(image.shortcode) ? (
                    <ImageTileEdit
                      defaultShortcode={image.shortcode}
                      image={savedImages.get(image.shortcode) ?? image}
                      packUsage={currentMeta.usage}
                      useAuthentication={useAuthentication}
                      onCancel={handleImageEditCancel}
                      onSave={handleImageEditSave}
                    />
                  ) : (
                    <ImageTile
                      defaultShortcode={image.shortcode}
                      image={savedImages.get(image.shortcode) ?? image}
                      packUsage={currentMeta.usage}
                      useAuthentication={useAuthentication}
                      canEdit={canEdit}
                      onEdit={handleImageEdit}
                      deleted={deleteImages.has(image.shortcode)}
                      onDeleteToggle={handleDeleteToggle}
                    />
                  )}
                </SequenceCard>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  }
);
