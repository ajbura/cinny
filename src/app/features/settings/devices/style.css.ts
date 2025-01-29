import { style } from '@vanilla-extract/css';
import { config } from 'folds';
import { ContainerColor } from '../../../styles/ContainerColor.css';

export const UnverifiedCard = style([
  ContainerColor({ variant: 'Warning' }),
  {
    padding: config.space.S200,
    borderRadius: config.radii.R300,
    borderWidth: config.borderWidth.B300,
  },
]);
