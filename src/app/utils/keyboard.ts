import { isKeyHotkey } from 'is-hotkey';
import { KeyboardEventHandler } from 'react';
import { isTaggedAsComposing } from '../hooks/useSafariCompositionTaggingForKeyDown';

export interface KeyboardEventLike {
  key: string;
  which: number;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  preventDefault(): void;
}

export function isComposing(evt: object): boolean {
  if ('nativeEvent' in evt && typeof evt.nativeEvent === 'object' && evt.nativeEvent !== null) {
    return isComposing(evt.nativeEvent)
  }
  if (isTaggedAsComposing(evt)) {
    return true
  }
  if ('isComposing' in evt && typeof evt.isComposing === 'boolean') {
    return evt.isComposing
  }
  return false
}

export const onTabPress = (evt: KeyboardEventLike, callback: () => void) => {
  if (!isComposing(evt) && isKeyHotkey('tab', evt)) {
    evt.preventDefault();
    callback();
  }
};

export const preventScrollWithArrowKey: KeyboardEventHandler = (evt) => {
  if (!isComposing(evt.nativeEvent) && isKeyHotkey(['arrowup', 'arrowright', 'arrowdown', 'arrowleft'], evt)) {
    evt.preventDefault();
  }
};

export const onEnterOrSpace =
  <T>(callback: (evt: T) => void) =>
  (evt: KeyboardEventLike) => {
    if (!isComposing(evt) && (isKeyHotkey('enter', evt) || isKeyHotkey('space', evt))) {
      evt.preventDefault();
      callback(evt as T);
    }
  };

export const stopPropagation = (evt: KeyboardEvent): boolean => {
  evt.stopPropagation();
  return true;
};
