import { useMemo } from 'react';
import { RoomPinnedEventsEventContent } from 'matrix-js-sdk/lib/types';
import { Room } from 'matrix-js-sdk';
import { StateEvent } from '../../types/matrix/room';
import { useStateEvent } from './useStateEvent';

export const useRoomPinnedEvents = (room: Room): string[] => {
  const pinEvent = useStateEvent(room, StateEvent.RoomPinnedEvents);
  const events = useMemo(() => {
    const content = pinEvent?.getContent<RoomPinnedEventsEventContent>();
    return content?.pinned ?? [];
  }, [pinEvent]);

  return events;
};
