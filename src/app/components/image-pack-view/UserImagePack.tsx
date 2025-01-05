import React from 'react';
import { ImagePackContent } from './ImagePackContent';
import { ImagePack } from '../../plugins/custom-emoji';

type UserImagePackProps = {
  imagePack: ImagePack;
};

export function UserImagePack({ imagePack }: UserImagePackProps) {
  return <ImagePackContent imagePack={imagePack} canEdit />;
}
