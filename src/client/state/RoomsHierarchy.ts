import { MatrixClient, Room } from 'matrix-js-sdk';
import { RoomHierarchy } from 'matrix-js-sdk/lib/room-hierarchy';

class RoomsHierarchy {
  matrixClient: MatrixClient;

  _maxDepth: number;

  _suggestedOnly: boolean;

  _limit: number;

  roomIdToHierarchy: Map<any, any>;

  constructor(matrixClient: MatrixClient, limit = 20, maxDepth = 1, suggestedOnly = false) {
    this.matrixClient = matrixClient;
    this._maxDepth = maxDepth;
    this._suggestedOnly = suggestedOnly;
    this._limit = limit;

    this.roomIdToHierarchy = new Map();
  }

  getHierarchy(roomId: string) {
    return this.roomIdToHierarchy.get(roomId);
  }

  removeHierarchy(roomId: string) {
    return this.roomIdToHierarchy.delete(roomId);
  }

  canLoadMore(roomId: string) {
    const roomHierarchy = this.getHierarchy(roomId);
    if (!roomHierarchy) return true;
    return roomHierarchy.canLoadMore;
  }

  async load(roomId: string, limit = this._limit) {
    let roomHierarchy = this.getHierarchy(roomId);

    if (!roomHierarchy) {
      roomHierarchy = new RoomHierarchy(
        { roomId, client: this.matrixClient } as Room,
        limit,
        this._maxDepth,
        this._suggestedOnly
      );
      this.roomIdToHierarchy.set(roomId, roomHierarchy);
    }

    try {
      await roomHierarchy.load(limit);
      return roomHierarchy.rooms;
    } catch {
      return roomHierarchy.rooms;
    }
  }
}

export default RoomsHierarchy;
