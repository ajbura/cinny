import React, { useMemo } from 'react';
import { as, ContainerColor, toRem } from 'folds';
import { randomNumberBetween } from '../../../utils/common';
import { LinePlaceholder } from './LinePlaceholder';
import { CompactLayout } from '../layout';

export const CompactPlaceholder = as<'div', { variant?: ContainerColor }>(
  ({ variant, ...props }, ref) => {
    const nameSize = useMemo(() => randomNumberBetween(40, 100), []);
    const msgSize = useMemo(() => randomNumberBetween(120, 500), []);

    return (
      <CompactLayout
        {...props}
        ref={ref}
        before={
          <>
            <LinePlaceholder variant={variant} style={{ maxWidth: toRem(50) }} />
            <LinePlaceholder variant={variant} style={{ maxWidth: toRem(nameSize) }} />
          </>
        }
      >
        <LinePlaceholder variant={variant} style={{ maxWidth: toRem(msgSize) }} />
      </CompactLayout>
    );
  }
);
