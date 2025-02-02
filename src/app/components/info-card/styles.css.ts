import { style } from '@vanilla-extract/css';
import { config } from 'folds';

export const InfoCard = style([
  {
    padding: config.space.S200,
    borderRadius: config.radii.R300,
    borderWidth: config.borderWidth.B300,
  },
]);
