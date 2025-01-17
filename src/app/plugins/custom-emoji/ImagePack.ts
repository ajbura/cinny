import { MatrixEvent } from 'matrix-js-sdk';
import { PackAddress } from './PackAddress';
import { PackImageReader } from './PackImageReader';
import { PackImagesReader } from './PackImagesReader';
import { PackMetaReader } from './PackMetaReader';
import { ImageUsage, PackContent } from './types';

export class ImagePack {
  public readonly id: string;

  public readonly deleted: boolean;

  public readonly address: PackAddress | undefined;

  public readonly meta: PackMetaReader;

  public readonly images: PackImagesReader;

  private emoticonMemo: PackImageReader[] | undefined;

  private stickerMemo: PackImageReader[] | undefined;

  constructor(id: string, content: PackContent, address: PackAddress | undefined) {
    this.id = id;

    this.address = address;

    this.deleted = content.pack === undefined && content.images === undefined;

    this.meta = new PackMetaReader(content.pack ?? {});
    this.images = new PackImagesReader(content.images ?? {});
  }

  static fromMatrixEvent(id: string, matrixEvent: MatrixEvent) {
    const roomId = matrixEvent.getRoomId();
    const stateKey = matrixEvent.getStateKey();

    const address =
      roomId && typeof stateKey === 'string' ? new PackAddress(roomId, stateKey) : undefined;

    const content = matrixEvent.getContent<PackContent>();

    const imagePack: ImagePack = new ImagePack(id, content, address);

    return imagePack;
  }

  public getImages(usage: ImageUsage): PackImageReader[] {
    if (usage === ImageUsage.Emoticon && this.emoticonMemo) {
      return this.emoticonMemo;
    }
    if (usage === ImageUsage.Sticker && this.stickerMemo) {
      return this.stickerMemo;
    }

    const images = Array.from(this.images.collection.values()).filter((image) => {
      const usg = image.usage ?? this.meta.usage;
      return usg.includes(usage);
    });

    if (usage === ImageUsage.Emoticon) {
      this.emoticonMemo = images;
    }
    if (usage === ImageUsage.Sticker) {
      this.stickerMemo = images;
    }

    return images;
  }

  public getAvatarUrl(usage: ImageUsage): string | undefined {
    if (this.meta.avatar) return this.meta.avatar;
    const images = this.getImages(usage);
    const firstImage = images[0];
    if (firstImage) return firstImage.url;
    return undefined;
  }
}
