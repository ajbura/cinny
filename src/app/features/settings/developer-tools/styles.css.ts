import { style } from '@vanilla-extract/css';
import { DefaultReset, config } from 'folds';

export const EditorHeader = style([
  DefaultReset,
  {
    paddingLeft: config.space.S400,
    paddingRight: config.space.S200,
    borderBottomWidth: config.borderWidth.B300,
    flexShrink: 0,
    gap: config.space.S200,
  },
]);

export const EditorContent = style([
  DefaultReset,
  {
    padding: config.space.S400,
  },
]);

export const EditorTextArea = style({
  fontFamily: 'monospace',
});
