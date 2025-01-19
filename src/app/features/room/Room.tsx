import React, { useCallback } from 'react';
import { Box, Line } from 'folds';
import { useParams } from 'react-router-dom';
import { isKeyHotkey } from 'is-hotkey';
import { RoomView } from './RoomView';
import { MembersDrawer } from './MembersDrawer';
import { ScreenSize, useScreenSizeContext } from '../../hooks/useScreenSize';
import { useSetting } from '../../state/hooks/settings';
import { settingsAtom } from '../../state/settings';
import { PowerLevelsContextProvider, usePowerLevels } from '../../hooks/usePowerLevels';
import { useRoom } from '../../hooks/useRoom';
import { useKeyDown } from '../../hooks/useKeyDown';
import { markAsRead } from '../../../client/action/notifications';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { useRoomMembers } from '../../hooks/useRoomMembers';
import { PageRootFloat } from '../../components/page';
import { SidebarNav } from '../../pages/client/SidebarNav';
import { SlideMenuChild } from '../../components/SlideMenuChild';
import { useSlideMenu } from '../../hooks/useSlideMenu';

export function Room() {
  const { eventId } = useParams();
  const room = useRoom();
  const mx = useMatrixClient();

  const [isDrawer] = useSetting(settingsAtom, 'isPeopleDrawer');
  const screenSize = useScreenSizeContext();
  const powerLevels = usePowerLevels(room);
  const members = useRoomMembers(mx, room.roomId);

  const { offset, offsetOverride, onTouchStart, onTouchEnd, onTouchMove } = useSlideMenu();

  useKeyDown(
    window,
    useCallback(
      (evt) => {
        if (isKeyHotkey('escape', evt)) {
          markAsRead(mx, room.roomId);
        }
      },
      [mx, room.roomId]
    )
  );

  return (
    <PowerLevelsContextProvider value={powerLevels}>
      <Box grow="Yes" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onTouchMove={onTouchMove}>
        <RoomView room={room} eventId={eventId} />
        {screenSize === ScreenSize.Desktop && isDrawer && (
          <>
            <Line variant="Background" direction="Vertical" size="300" />
            <MembersDrawer key={room.roomId} room={room} members={members} />
          </>
        )}
      </Box>
      {/* Create a slide menu offscreen for mobile. Same for all other slide menus. */}
      {screenSize === ScreenSize.Mobile && <PageRootFloat style={{
        transform: `translateX(${offsetOverride ? 0 : (-window.innerWidth + offset[0])}px)`,
        transition: offset[0] ? "none" : ""
      }}>
        <SidebarNav />
        <SlideMenuChild />
      </PageRootFloat>}
    </PowerLevelsContextProvider>
  );
}
