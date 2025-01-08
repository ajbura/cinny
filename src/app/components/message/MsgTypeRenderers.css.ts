import { style } from '@vanilla-extract/css';

export const buttonStyle = style({
  width: '15%',
  color: '#5e9ecf',
  backgroundColor: 'transparent',
  border: 'none',
  padding: '0',
  textDecoration: 'underline',
  cursor: 'pointer',
  transition: 'color 0.3s, text-decoration 0.3s',

  selectors: {
    '&:hover': {
      color: '#1e6e8c',
      textDecoration: 'none',
      backgroundColor: 'transparent',
    },
  },
});
