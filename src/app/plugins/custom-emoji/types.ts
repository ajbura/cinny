import { IImageInfo } from '../../../types/matrix/common';

// https://github.com/Sorunome/matrix-doc/blob/soru/emotes/proposals/2545-emotes.md

/**
 * im.ponies.emote_rooms content
 */
export type PackStateKeyToUnknown = Record<string, unknown>;
export type RoomIdToPackInfo = Record<string, PackStateKeyToUnknown>;
export type EmoteRoomsContent = {
  rooms?: RoomIdToPackInfo;
};

/**
 * Pack
 */
export enum ImageUsage {
  Emoticon = 'emoticon',
  Sticker = 'sticker',
}

export type PackImage = {
  url: string;
  body?: string;
  usage?: ImageUsage[];
  info?: IImageInfo;
};

export type PackImages = Record<string, PackImage>;

export type PackMeta = {
  display_name?: string;
  avatar_url?: string;
  attribution?: string;
  usage?: ImageUsage[];
};

export type PackContent = {
  pack?: PackMeta;
  images?: PackImages;
};