import { MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';
import { ImagePack } from './ImagePack';
import { EmoteRoomsContent } from './types';
import { StateEvent } from '../../../types/matrix/room';
import { getAccountData, getStateEvents } from '../../utils/room';
import { AccountDataEvent } from '../../../types/matrix/accountData';

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

/**
 * @param {MatrixClient} mx Provide if you want to include user personal/global pack
 * @param {Room[]} rooms Provide rooms if you want to include rooms pack
 * @returns {ImagePack[]} packs
 */
export function getRelevantPacks(mx?: MatrixClient, rooms?: Room[]): ImagePack[] {
  const userPack = mx && getUserImagePack(mx);
  const userPacks = userPack ? [userPack] : [];
  const globalPacks = mx ? getGlobalImagePacks(mx) : [];
  const globalPackIds = new Set(globalPacks.map((pack) => pack.id));
  const roomsPack = rooms?.flatMap(getRoomImagePacks) ?? [];

  return userPacks.concat(
    globalPacks,
    roomsPack.filter((pack) => !globalPackIds.has(pack.id))
  );
}
