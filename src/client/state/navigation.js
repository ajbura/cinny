import EventEmitter from 'events';
import appDispatcher from '../dispatcher';
import cons from './cons';

class Navigation extends EventEmitter {
  constructor() {
    super();

    this.selectedTab = cons.tabs.HOME;
    this.selectedSpaceId = null;
    this.selectedSpacePath = [cons.tabs.HOME];

    this.selectedRoomId = null;
    this.isPeopleDrawerVisible = true;
  }

  _setSpacePath(roomId) {
    if (roomId === null || roomId === cons.tabs.HOME) {
      this.selectedSpacePath = [cons.tabs.HOME];
      return;
    }
    if (this.selectedSpacePath.includes(roomId)) {
      const spIndex = this.selectedSpacePath.indexOf(roomId);
      this.selectedSpacePath = this.selectedSpacePath.slice(0, spIndex + 1);
      return;
    }
    this.selectedSpacePath.push(roomId);
  }

  navigate(action) {
    const actions = {
      [cons.actions.navigation.SELECT_TAB]: () => {
        this.selectedTab = action.tabId;
        if (this.selectedTab !== cons.tabs.DIRECTS) {
          if (this.selectedTab === cons.tabs.HOME) {
            this.selectedSpacePath = [cons.tabs.HOME];
            this.selectedSpaceId = null;
          } else {
            this.selectedSpacePath = [this.selectedTab];
            this.selectedSpaceId = this.selectedTab;
          }
          this.emit(cons.events.navigation.SPACE_SELECTED, this.selectedSpaceId);
        } else this.selectedSpaceId = null;
        this.emit(cons.events.navigation.TAB_SELECTED, this.selectedTab);
      },
      [cons.actions.navigation.SELECT_SPACE]: () => {
        this._setSpacePath(action.roomId);
        this.selectedSpaceId = action.roomId;
        this.emit(cons.events.navigation.SPACE_SELECTED, this.selectedSpaceId);
      },
      [cons.actions.navigation.SELECT_ROOM]: () => {
        const prevSelectedRoomId = this.selectedRoomId;
        this.selectedRoomId = action.roomId;
        this.emit(cons.events.navigation.ROOM_SELECTED, this.selectedRoomId, prevSelectedRoomId);
      },
      [cons.actions.navigation.TOGGLE_PEOPLE_DRAWER]: () => {
        this.isPeopleDrawerVisible = !this.isPeopleDrawerVisible;
        this.emit(cons.events.navigation.PEOPLE_DRAWER_TOGGLED, this.isPeopleDrawerVisible);
      },
      [cons.actions.navigation.OPEN_INVITE_LIST]: () => {
        this.emit(cons.events.navigation.INVITE_LIST_OPENED);
      },
      [cons.actions.navigation.OPEN_PUBLIC_ROOMS]: () => {
        this.emit(cons.events.navigation.PUBLIC_ROOMS_OPENED, action.searchTerm);
      },
      [cons.actions.navigation.OPEN_CREATE_ROOM]: () => {
        this.emit(cons.events.navigation.CREATE_ROOM_OPENED);
      },
      [cons.actions.navigation.OPEN_INVITE_USER]: () => {
        this.emit(cons.events.navigation.INVITE_USER_OPENED, action.roomId, action.searchTerm);
      },
      [cons.actions.navigation.OPEN_PROFILE_VIEWER]: () => {
        this.emit(cons.events.navigation.PROFILE_VIEWER_OPENED, action.userId, action.roomId);
      },
      [cons.actions.navigation.OPEN_SETTINGS]: () => {
        this.emit(cons.events.navigation.SETTINGS_OPENED);
      },
      [cons.actions.navigation.OPEN_EMOJIBOARD]: () => {
        this.emit(
          cons.events.navigation.EMOJIBOARD_OPENED,
          action.cords, action.requestEmojiCallback,
        );
      },
      [cons.actions.navigation.OPEN_READRECEIPTS]: () => {
        this.emit(
          cons.events.navigation.READRECEIPTS_OPENED,
          action.roomId,
          action.eventId,
        );
      },
      [cons.actions.navigation.OPEN_ROOMOPTIONS]: () => {
        this.emit(
          cons.events.navigation.ROOMOPTIONS_OPENED,
          action.cords,
          action.roomId,
          action.options,
        );
      },
    };
    actions[action.type]?.();
  }
}

const navigation = new Navigation();
appDispatcher.register(navigation.navigate.bind(navigation));

export default navigation;
