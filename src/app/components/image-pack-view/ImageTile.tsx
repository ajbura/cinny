import React, { MouseEventHandler, useState } from 'react';
import { Chip, Icon, Icons, Text, PopOut, Menu, RectCords } from 'folds';
import FocusTrap from 'focus-trap-react';
import { stopPropagation } from '../../utils/keyboard';
import { UsageSelector, useUsageStr } from './UsageSelector';
import { mxcUrlToHttp } from '../../utils/matrix';
import * as css from './style.css';
import { ImageUsage, PackImageReader } from '../../plugins/custom-emoji';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { SettingTile } from '../setting-tile';

type ImageTileProps = {
  useAuthentication: boolean;
  packUsage: ImageUsage[];
  image: PackImageReader;
};
export function ImageTile({ image, packUsage, useAuthentication }: ImageTileProps) {
  const mx = useMatrixClient();
  const getUsageStr = useUsageStr();
  const usage = image.usage ?? packUsage;

  const [menuCords, setMenuCords] = useState<RectCords>();

  const handleChange = (usg: ImageUsage[]) => {
    console.log(usg);
  };

  const handleSelectUsage: MouseEventHandler<HTMLButtonElement> = (event) => {
    setMenuCords(event.currentTarget.getBoundingClientRect());
  };

  return (
    <SettingTile
      before={
        <img
          className={css.ImagePackImage}
          src={mxcUrlToHttp(mx, image.url, useAuthentication) ?? ''}
          alt={image.shortcode}
        />
      }
      title={image.shortcode}
      description={image.body}
      after={
        <>
          <Chip
            variant="Secondary"
            radii="Pill"
            after={<Icon src={Icons.ChevronBottom} size="100" />}
            onClick={handleSelectUsage}
          >
            <Text size="B300">{getUsageStr(usage)}</Text>
          </Chip>
          <PopOut
            anchor={menuCords}
            offset={5}
            position="Bottom"
            align="End"
            content={
              <FocusTrap
                focusTrapOptions={{
                  initialFocus: false,
                  onDeactivate: () => setMenuCords(undefined),
                  clickOutsideDeactivates: true,
                  isKeyForward: (evt: KeyboardEvent) =>
                    evt.key === 'ArrowDown' || evt.key === 'ArrowRight',
                  isKeyBackward: (evt: KeyboardEvent) =>
                    evt.key === 'ArrowUp' || evt.key === 'ArrowLeft',
                  escapeDeactivates: stopPropagation,
                }}
              >
                <Menu>
                  <UsageSelector selected={usage} onChange={handleChange} />
                </Menu>
              </FocusTrap>
            }
          />
        </>
      }
    />
  );
}
