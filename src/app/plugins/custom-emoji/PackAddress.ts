export class PackAddress {
  public readonly roomId: string;

  public readonly stateKey: string;

  constructor(roomId: string, stateKey: string) {
    this.roomId = roomId;
    this.stateKey = stateKey;
  }
}
