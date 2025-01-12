import React, { FormEventHandler, useCallback, useMemo, useState } from 'react';
import {
  as,
  Box,
  Text,
  config,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
  Icon,
  Icons,
  Input,
  TextArea,
  Chip,
  Menu,
} from 'folds';
import Linkify from 'linkify-react';
import { ImagePack, ImageUsage, packMetaEqual, PackMetaReader } from '../../plugins/custom-emoji';
import { mxcUrlToHttp } from '../../utils/matrix';
import { useMediaAuthentication } from '../../hooks/useMediaAuthentication';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { SequenceCard } from '../sequence-card';
import { nameInitials } from '../../utils/common';
import { BreakWord } from '../../styles/Text.css';
import { LINKIFY_OPTS } from '../../plugins/react-custom-html-parser';
import { ContainerColor } from '../../styles/ContainerColor.css';
import { ImageTile } from './ImageTile';
import { SettingTile } from '../setting-tile';
import { UsageSwitcher } from './UsageSwitcher';
import { useFilePicker } from '../../hooks/useFilePicker';
import { useObjectURL } from '../../hooks/useObjectURL';
import { createUploadAtom, UploadSuccess } from '../../state/upload';
import { CompactUploadCardRenderer } from '../upload-card';
import * as css from './style.css';

type ImagePackAvatarProps = {
  url?: string;
  name?: string;
};
function ImagePackAvatar({ url, name }: ImagePackAvatarProps) {
  return (
    <Avatar size="500" className={ContainerColor({ variant: 'Secondary' })}>
      {url ? (
        <AvatarImage src={url} alt={name ?? 'Unknown'} />
      ) : (
        <AvatarFallback>
          <Text size="H2">{nameInitials(name ?? 'Unknown')}</Text>
        </AvatarFallback>
      )}
    </Avatar>
  );
}

type ImagePackProfileProps = {
  meta: PackMetaReader;
  canEdit?: boolean;
  onEdit?: () => void;
};
function ImagePackProfile({ meta, canEdit, onEdit }: ImagePackProfileProps) {
  const mx = useMatrixClient();
  const useAuthentication = useMediaAuthentication();
  const avatarUrl = meta.avatar
    ? mxcUrlToHttp(mx, meta.avatar, useAuthentication) ?? undefined
    : undefined;

  return (
    <Box gap="400">
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
        {canEdit && (
          <Box gap="200">
            <Chip
              variant="Secondary"
              fill="Soft"
              radii="300"
              before={<Icon size="50" src={Icons.Pencil} />}
              onClick={onEdit}
              outlined
            >
              <Text size="B300">Edit</Text>
            </Chip>
          </Box>
        )}
      </Box>
      <Box shrink="No">
        <ImagePackAvatar url={avatarUrl} name={meta.name} />
      </Box>
    </Box>
  );
}

type ImagePackProfileEditProps = {
  meta: PackMetaReader;
  onCancel: () => void;
  onSave: (meta: PackMetaReader) => void;
};
function ImagePackProfileEdit({ meta, onCancel, onSave }: ImagePackProfileEditProps) {
  const mx = useMatrixClient();
  const useAuthentication = useMediaAuthentication();
  const [avatar, setAvatar] = useState(meta.avatar);

  const avatarUrl = avatar ? mxcUrlToHttp(mx, avatar, useAuthentication) ?? undefined : undefined;

  const [imageFile, setImageFile] = useState<File>();
  const avatarFileUrl = useObjectURL(imageFile);
  const uploadingAvatar = avatarFileUrl ? avatar === meta.avatar : false;
  const uploadAtom = useMemo(() => {
    if (imageFile) return createUploadAtom(imageFile);
    return undefined;
  }, [imageFile]);

  const pickFile = useFilePicker(setImageFile, false);

  const handleRemoveUpload = useCallback(() => {
    setImageFile(undefined);
    setAvatar(meta.avatar);
  }, [meta.avatar]);

  const handleUploaded = useCallback((upload: UploadSuccess) => {
    setAvatar(upload.mxc);
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();
    if (uploadingAvatar) return;

    const target = evt.target as HTMLFormElement | undefined;
    const nameInput = target?.nameInput as HTMLInputElement | undefined;
    const attributionTextArea = target?.attributionTextArea as HTMLTextAreaElement | undefined;
    if (!nameInput || !attributionTextArea) return;

    const name = nameInput.value.trim();
    const attribution = attributionTextArea.value.trim();
    if (!name) return;

    const metaReader = new PackMetaReader({
      avatar_url: avatar,
      display_name: name,
      attribution,
    });
    onSave(metaReader);
  };

  return (
    <Box as="form" onSubmit={handleSubmit} direction="Column" gap="400">
      <Box gap="400">
        <Box grow="Yes" direction="Column" gap="100">
          <Text size="L400">Pack Avatar</Text>
          {uploadAtom ? (
            <Box gap="200" direction="Column">
              <CompactUploadCardRenderer
                uploadAtom={uploadAtom}
                onRemove={handleRemoveUpload}
                onComplete={handleUploaded}
              />
            </Box>
          ) : (
            <Box gap="200">
              <Button
                type="button"
                size="300"
                variant="Secondary"
                fill="Soft"
                radii="300"
                onClick={() => pickFile('image/*')}
              >
                <Text size="B300">Upload</Text>
              </Button>
              {!avatar && meta.avatar && (
                <Button
                  type="button"
                  size="300"
                  variant="Success"
                  fill="None"
                  radii="300"
                  onClick={() => setAvatar(meta.avatar)}
                >
                  <Text size="B300">Reset</Text>
                </Button>
              )}
              {avatar && (
                <Button
                  type="button"
                  size="300"
                  variant="Critical"
                  fill="None"
                  radii="300"
                  onClick={() => setAvatar(undefined)}
                >
                  <Text size="B300">Remove</Text>
                </Button>
              )}
            </Box>
          )}
        </Box>
        <Box shrink="No">
          <ImagePackAvatar url={avatarFileUrl ?? avatarUrl} name={meta.name} />
        </Box>
      </Box>
      <Box direction="Inherit" gap="100">
        <Text size="L400">Name</Text>
        <Input name="nameInput" defaultValue={meta.name} variant="Secondary" radii="300" required />
      </Box>
      <Box direction="Inherit" gap="100">
        <Text size="L400">Attribution</Text>
        <TextArea
          name="attributionTextArea"
          defaultValue={meta.attribution}
          variant="Secondary"
          radii="300"
        />
      </Box>
      <Box gap="300">
        <Button type="submit" variant="Success" size="300" radii="300" disabled={uploadingAvatar}>
          <Text size="B300">Save</Text>
        </Button>
        <Button
          type="reset"
          onClick={onCancel}
          variant="Secondary"
          fill="Soft"
          size="300"
          radii="300"
        >
          <Text size="B300">Cancel</Text>
        </Button>
      </Box>
    </Box>
  );
}

export type ImagePackContentProps = {
  imagePack: ImagePack;
  canEdit?: boolean;
};

export const ImagePackContent = as<'div', ImagePackContentProps>(
  ({ imagePack, canEdit, ...props }, ref) => {
    const useAuthentication = useMediaAuthentication();
    const images = useMemo(() => Array.from(imagePack.images.collection.values()), [imagePack]);

    const [metaEditing, setMetaEditing] = useState(false);
    const [unsavedMeta, setUnsavedMeta] = useState<PackMetaReader>();
    const currentMeta = unsavedMeta ?? imagePack.meta;

    const handleMetaSave = useCallback(
      (editedMeta: PackMetaReader) => {
        setMetaEditing(false);
        setUnsavedMeta(
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
        setUnsavedMeta(
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

    const handleResetSavedChanges = () => {
      setUnsavedMeta(undefined);
    };
    const handleApplySavedChanges = () => {
      setUnsavedMeta(undefined);
    };

    const unsavedChanges = unsavedMeta && !packMetaEqual(imagePack.meta, unsavedMeta);
    const canApplyChanges = !metaEditing;

    return (
      <Box grow="Yes" direction="Column" gap="700" {...props} ref={ref}>
        {unsavedChanges && (
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
                  variant="SurfaceVariant"
                  direction="Column"
                  gap="400"
                >
                  <ImageTile
                    image={image}
                    packUsage={currentMeta.usage}
                    useAuthentication={useAuthentication}
                    canEdit={canEdit}
                  />
                </SequenceCard>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  }
);
