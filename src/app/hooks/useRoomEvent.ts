import { MatrixEvent, Room } from 'matrix-js-sdk';
import { useCallback, useMemo } from 'react';
import to from 'await-to-js';
import { CryptoBackend } from 'matrix-js-sdk/lib/common-crypto/CryptoBackend';
import { useQuery } from '@tanstack/react-query';
import { useMatrixClient } from './useMatrixClient';

const useFetchEvent = (room: Room, eventId: string) => {
  const mx = useMatrixClient();

  const fetchEventCallback = useCallback(async () => {
    const evt = await mx.fetchRoomEvent(room.roomId, eventId);
    const mEvent = new MatrixEvent(evt);

    if (mEvent.isEncrypted() && mx.getCrypto()) {
      await to(mEvent.attemptDecryption(mx.getCrypto() as CryptoBackend));
    }

    return mEvent;
  }, [mx, room.roomId, eventId]);

  return fetchEventCallback;
};

/**
 *
 * @param room
 * @param eventId
 * @returns `MatrixEvent`, `undefined` means loading, `null` means failure
 */
export const useRoomEvent = (
  room: Room,
  eventId: string,
  getLocally?: () => MatrixEvent | undefined
) => {
  const event = useMemo(() => {
    if (getLocally) return getLocally();
    return room.findEventById(eventId);
  }, [room, eventId, getLocally]);

  const fetchEvent = useFetchEvent(room, eventId);

  const { data, error } = useQuery({
    enabled: event === undefined,
    queryKey: [room.roomId, eventId],
    queryFn: fetchEvent,
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000, // 1hour
  });

  if (event) return event;
  if (data) return data;
  if (error) return null;

  return undefined;
};
