import { MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';
import { ImagePack } from './ImagePack';
import { EmoteRoomsContent, ImageUsage } from './types';
import { StateEvent } from '../../../types/matrix/room';
import { getAccountData, getStateEvents } from '../../utils/room';
import { AccountDataEvent } from '../../../types/matrix/accountData';
import { PackMetaReader } from './PackMetaReader';

export function imageUsageEqual(u1: ImageUsage[], u2: ImageUsage[]) {
  return u1.length === u2.length && u1.every((u) => u2.includes(u));
}

export function packMetaEqual(a: PackMetaReader, b: PackMetaReader): boolean {
  return (
    a.name === b.name &&
    a.avatar === b.avatar &&
    a.attribution === b.attribution &&
    imageUsageEqual(a.usage, b.usage)
  );
}

export function makeImagePacks(packEvents: MatrixEvent[]): ImagePack[] {
  return packEvents.reduce<ImagePack[]>((imagePacks, packEvent) => {
    const packId = packEvent.getId();
    if (!packId) return imagePacks;
    imagePacks.push(ImagePack.fromMatrixEvent(packId, packEvent));
    return imagePacks;
  }, []);
}

export function getRoomImagePacks(room: Room): ImagePack[] {
  const packEvents = getStateEvents(room, StateEvent.PoniesRoomEmotes);
  return makeImagePacks(packEvents);
}

export function getGlobalImagePacks(mx: MatrixClient): ImagePack[] {
  const emoteRoomsContent = getAccountData(mx, AccountDataEvent.PoniesEmoteRooms)?.getContent() as
    | EmoteRoomsContent
    | undefined;
  if (typeof emoteRoomsContent !== 'object') return [];

  const { rooms: roomIdToPackInfo } = emoteRoomsContent;
  if (typeof roomIdToPackInfo !== 'object') return [];

  const roomIds = Object.keys(roomIdToPackInfo);

  const packs = roomIds.flatMap((roomId) => {
    if (typeof roomIdToPackInfo[roomId] !== 'object') return [];
    const room = mx.getRoom(roomId);
    if (!room) return [];
    const packStateKeyToUnknown = roomIdToPackInfo[roomId];
    const packEvents = getStateEvents(room, StateEvent.PoniesRoomEmotes);
    const globalPackEvents = packEvents.filter((mE) => {
      const stateKey = mE.getStateKey();
      if (typeof stateKey === 'string') return !!packStateKeyToUnknown[stateKey];
      return false;
    });
    return makeImagePacks(globalPackEvents);
  });

  return packs;
}

export function getUserImagePack(mx: MatrixClient): ImagePack | undefined {
  const packEvent = getAccountData(mx, AccountDataEvent.PoniesUserEmotes);
  const userId = mx.getUserId();
  if (!packEvent || !userId) {
    return undefined;
  }

  const userImagePack = ImagePack.fromMatrixEvent(userId, packEvent);
  return userImagePack;
}
