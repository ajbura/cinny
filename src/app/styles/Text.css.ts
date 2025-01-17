import { style } from '@vanilla-extract/css';

export const BreakWord = style({
  wordBreak: 'break-word',
});

export const LineClamp2 = style({
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

export const LineClamp3 = style({
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});
