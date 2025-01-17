import React from 'react';
import { Box, as } from 'folds';
import classNames from 'classnames';
import * as css from './LinePlaceholder.css';

export const LinePlaceholder = as<'div', css.LinePlaceholderVariants>(
  ({ className, variant, ...props }, ref) => (
    <Box
      className={classNames(css.LinePlaceholder({ variant }), className)}
      shrink="No"
      {...props}
      ref={ref}
    />
  )
);
