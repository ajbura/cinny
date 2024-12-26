import { ClientEvent, MatrixClient, MatrixEvent, Room, RoomStateEvent } from 'matrix-js-sdk';
import { useEffect, useMemo } from 'react';
import { AccountDataEvent } from '../../types/matrix/accountData';
import { StateEvent } from '../../types/matrix/room';
import { useForceUpdate } from './useForceUpdate';
import { getRelevantPacks, ImagePack, ImageUsage } from '../plugins/custom-emoji';

export const useRelevantImagePacks = (
  mx: MatrixClient,
  usage: ImageUsage,
  rooms: Room[]
): ImagePack[] => {
  const [forceCount, forceUpdate] = useForceUpdate();

  const relevantPacks = useMemo(
    () => getRelevantPacks(mx, rooms).filter((pack) => pack.getImages(usage).length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mx, usage, rooms, forceCount]
  );

  useEffect(() => {
    const handleUpdate = (event: MatrixEvent) => {
      if (
        event.getType() === AccountDataEvent.PoniesEmoteRooms ||
        event.getType() === AccountDataEvent.PoniesUserEmotes
      ) {
        forceUpdate();
      }
      const eventRoomId = event.getRoomId();
      if (
        eventRoomId &&
        event.getType() === StateEvent.PoniesRoomEmotes &&
        rooms.find((room) => room.roomId === eventRoomId)
      ) {
        forceUpdate();
      }
    };

    mx.on(ClientEvent.AccountData, handleUpdate);
    mx.on(RoomStateEvent.Events, handleUpdate);
    return () => {
      mx.removeListener(ClientEvent.AccountData, handleUpdate);
      mx.removeListener(RoomStateEvent.Events, handleUpdate);
    };
  }, [mx, rooms, forceUpdate]);

  return relevantPacks;
};
