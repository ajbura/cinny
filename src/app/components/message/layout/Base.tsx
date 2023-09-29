import React from 'react';
import { as } from 'folds';
import classNames from 'classnames';
import * as css from './layout.css';

export const MessageBase = as<'div', css.MessageBaseVariants>(
  ({ className, highlight, collapse, space, ...props }, ref) => (
    <div
      className={classNames(css.MessageBase({ highlight, collapse, space }), className)}
      {...props}
      ref={ref}
    />
  )
);

export const EventBase = as<'div', css.EventBaseVariants>(
  ({ className, space, highlight, ...props }, ref) => (
    <div
      className={classNames(css.EventBase({ space, highlight }), className)}
      {...props}
      ref={ref}
    />
  )
);

export const AvatarBase = as<'span'>(({ className, ...props }, ref) => (
  <span className={classNames(css.AvatarBase, className)} {...props} ref={ref} />
));

export const Username = as<'span'>(({ as: AsUsername = 'span', className, ...props }, ref) => (
  <AsUsername className={classNames(css.Username, className)} {...props} ref={ref} />
));