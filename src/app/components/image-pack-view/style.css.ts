import { style } from '@vanilla-extract/css';
import { DefaultReset, toRem } from 'folds';

export const ImagePackImage = style([
  DefaultReset,
  {
    width: toRem(36),
    height: toRem(36),
    objectFit: 'contain',
  },
]);
