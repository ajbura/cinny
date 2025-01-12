import { style } from '@vanilla-extract/css';
import { config, DefaultReset, toRem } from 'folds';

export const ImagePackImage = style([
  DefaultReset,
  {
    width: toRem(36),
    height: toRem(36),
    objectFit: 'contain',
  },
]);

export const UnsavedMenu = style({
  position: 'sticky',
  padding: config.space.S200,
  paddingLeft: config.space.S400,
  top: config.space.S400,
  left: config.space.S400,
  right: 0,
  zIndex: 1,
});
