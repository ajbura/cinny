import React, { useEffect } from 'react';
import { Chip, Icon, IconButton, Icons, Text, color } from 'folds';
import { UploadCard, UploadCardError, CompactUploadCardProgress } from './UploadCard';
import { TUploadAtom, UploadStatus, UploadSuccess, useBindUploadAtom } from '../../state/upload';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { TUploadContent } from '../../utils/matrix';
import { getFileTypeIcon } from '../../utils/common';

type CompactUploadCardRendererProps = {
  isEncrypted?: boolean;
  uploadAtom: TUploadAtom;
  onRemove: (file: TUploadContent) => void;
  onComplete?: (upload: UploadSuccess) => void;
};
export function CompactUploadCardRenderer({
  isEncrypted,
  uploadAtom,
  onRemove,
  onComplete,
}: CompactUploadCardRendererProps) {
  const mx = useMatrixClient();
  const { upload, startUpload, cancelUpload } = useBindUploadAtom(mx, uploadAtom, isEncrypted);
  const { file } = upload;

  if (upload.status === UploadStatus.Idle) startUpload();

  const removeUpload = () => {
    cancelUpload();
    onRemove(file);
  };

  useEffect(() => {
    if (upload.status === UploadStatus.Success) {
      onComplete?.(upload);
    }
  }, [upload, onComplete]);

  return (
    <UploadCard
      compact
      outlined
      radii="300"
      before={<Icon src={getFileTypeIcon(Icons, file.type)} />}
      after={
        <>
          {upload.status === UploadStatus.Error && (
            <Chip
              as="button"
              onClick={startUpload}
              aria-label="Retry Upload"
              variant="Critical"
              radii="Pill"
              outlined
            >
              <Text size="B300">Retry</Text>
            </Chip>
          )}
          <IconButton
            onClick={removeUpload}
            aria-label="Cancel Upload"
            variant="SurfaceVariant"
            radii="Pill"
            size="300"
          >
            <Icon src={Icons.Cross} size="200" />
          </IconButton>
        </>
      }
    >
      {upload.status === UploadStatus.Success ? (
        <>
          <Text size="H6" truncate>
            {file.name}
          </Text>
          <Icon style={{ color: color.Success.Main }} src={Icons.Check} size="100" />
        </>
      ) : (
        <>
          {upload.status === UploadStatus.Idle && (
            <CompactUploadCardProgress sentBytes={0} totalBytes={file.size} />
          )}
          {upload.status === UploadStatus.Loading && (
            <CompactUploadCardProgress sentBytes={upload.progress.loaded} totalBytes={file.size} />
          )}
          {upload.status === UploadStatus.Error && (
            <UploadCardError>
              <Text size="T200">{upload.error.message}</Text>
            </UploadCardError>
          )}
        </>
      )}
    </UploadCard>
  );
}
