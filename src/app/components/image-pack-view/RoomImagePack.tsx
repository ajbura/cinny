import React from 'react';
import { Room } from 'matrix-js-sdk';
import { usePowerLevels, usePowerLevelsAPI } from '../../hooks/usePowerLevels';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { ImagePackContent } from './ImagePackContent';
import { ImagePack } from '../../plugins/custom-emoji';
import { StateEvent } from '../../../types/matrix/room';

type RoomImagePackProps = {
  room: Room;
  imagePack: ImagePack;
};

export function RoomImagePack({ room, imagePack }: RoomImagePackProps) {
  const mx = useMatrixClient();
  const userId = mx.getUserId()!;
  const powerLevels = usePowerLevels(room);

  const { getPowerLevel, canSendStateEvent } = usePowerLevelsAPI(powerLevels);
  const canEditImagePack = canSendStateEvent(StateEvent.PoniesRoomEmotes, getPowerLevel(userId));

  return <ImagePackContent imagePack={imagePack} canEdit={canEditImagePack} />;
}
