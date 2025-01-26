import React, { MouseEventHandler, useCallback, useState } from 'react';
import {
  Box,
  Text,
  IconButton,
  Icon,
  Icons,
  Scroll,
  Switch,
  Overlay,
  OverlayBackdrop,
  OverlayCenter,
  Modal,
  Chip,
  Button,
  PopOut,
  RectCords,
  Menu,
  config,
  MenuItem,
} from 'folds';
import { MatrixEvent } from 'matrix-js-sdk';
import FocusTrap from 'focus-trap-react';
import { Page, PageContent, PageHeader } from '../../../components/page';
import { SequenceCard } from '../../../components/sequence-card';
import { SequenceCardStyle } from '../styles.css';
import { SettingTile } from '../../../components/setting-tile';
import { useSetting } from '../../../state/hooks/settings';
import { settingsAtom } from '../../../state/settings';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useAccountDataCallback } from '../../../hooks/useAccountDataCallback';
import { TextViewer } from '../../../components/text-viewer';
import { stopPropagation } from '../../../utils/keyboard';
import { AccountDataEditor } from './AccountDataEditor';
import { copyToClipboard } from '../../../utils/dom';

function AccountData() {
  const mx = useMatrixClient();
  const [view, setView] = useState(false);
  const [accountData, setAccountData] = useState(() => Array.from(mx.store.accountData.values()));
  const [selectedEvent, selectEvent] = useState<MatrixEvent>();
  const [menuCords, setMenuCords] = useState<RectCords>();
  const [selectedOption, selectOption] = useState<'edit' | 'inspect'>();

  useAccountDataCallback(
    mx,
    useCallback(
      () => setAccountData(Array.from(mx.store.accountData.values())),
      [mx, setAccountData]
    )
  );

  const handleMenu: MouseEventHandler<HTMLButtonElement> = (evt) => {
    const target = evt.currentTarget;
    const eventType = target.getAttribute('data-event-type');
    if (eventType) {
      const mEvent = accountData.find((mEvt) => mEvt.getType() === eventType);
      setMenuCords(evt.currentTarget.getBoundingClientRect());
      selectEvent(mEvent);
    }
  };

  const handleMenuClose = () => setMenuCords(undefined);

  const handleEdit = () => {
    selectOption('edit');
    setMenuCords(undefined);
  };
  const handleInspect = () => {
    selectOption('inspect');
    setMenuCords(undefined);
  };
  const handleClose = useCallback(() => {
    selectEvent(undefined);
    selectOption(undefined);
  }, []);

  return (
    <Box direction="Column" gap="100">
      <Text size="L400">Account Data</Text>
      <SequenceCard
        className={SequenceCardStyle}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      >
        <SettingTile
          title="Global"
          description="Data stored in your global account data."
          after={
            <Button
              onClick={() => setView(!view)}
              variant="Secondary"
              fill="Soft"
              size="300"
              radii="300"
              outlined
              before={
                <Icon src={view ? Icons.ChevronTop : Icons.ChevronBottom} size="100" filled />
              }
            >
              <Text size="B300">{view ? 'Collapse' : 'Expand'}</Text>
            </Button>
          }
        />
        {view && (
          <SettingTile>
            <Box direction="Column" gap="200">
              <Text size="L400">Types</Text>
              <Box gap="200" wrap="Wrap">
                <Chip
                  variant="Secondary"
                  fill="Soft"
                  radii="Pill"
                  onClick={handleEdit}
                  before={<Icon size="50" src={Icons.Plus} />}
                >
                  <Text size="T200" truncate>
                    Add New
                  </Text>
                </Chip>
                {accountData.map((mEvent) => (
                  <Chip
                    key={mEvent.getType()}
                    variant="Secondary"
                    fill="Soft"
                    radii="Pill"
                    aria-pressed={menuCords && selectedEvent?.getType() === mEvent.getType()}
                    onClick={handleMenu}
                    data-event-type={mEvent.getType()}
                  >
                    <Text size="T200" truncate>
                      {mEvent.getType()}
                    </Text>
                  </Chip>
                ))}
              </Box>
            </Box>
          </SettingTile>
        )}
        <PopOut
          anchor={menuCords}
          offset={5}
          position="Bottom"
          content={
            <FocusTrap
              focusTrapOptions={{
                initialFocus: false,
                onDeactivate: handleMenuClose,
                clickOutsideDeactivates: true,
                isKeyForward: (evt: KeyboardEvent) =>
                  evt.key === 'ArrowDown' || evt.key === 'ArrowRight',
                isKeyBackward: (evt: KeyboardEvent) =>
                  evt.key === 'ArrowUp' || evt.key === 'ArrowLeft',
                escapeDeactivates: stopPropagation,
              }}
            >
              <Menu>
                <Box direction="Column" gap="100" style={{ padding: config.space.S100 }}>
                  <MenuItem size="300" variant="Surface" radii="300" onClick={handleInspect}>
                    <Text size="T300">Inspect</Text>
                  </MenuItem>
                  <MenuItem size="300" variant="Surface" radii="300" onClick={handleEdit}>
                    <Text size="T300">Edit</Text>
                  </MenuItem>
                </Box>
              </Menu>
            </FocusTrap>
          }
        />
      </SequenceCard>
      {selectedEvent && selectedOption === 'inspect' && (
        <Overlay open backdrop={<OverlayBackdrop />}>
          <OverlayCenter>
            <FocusTrap
              focusTrapOptions={{
                initialFocus: false,
                onDeactivate: handleClose,
                clickOutsideDeactivates: true,
                escapeDeactivates: stopPropagation,
              }}
            >
              <Modal variant="Surface" size="500">
                <TextViewer
                  name={selectedEvent.getType() ?? 'Source Code'}
                  langName="json"
                  text={JSON.stringify(selectedEvent.getContent(), null, 2)}
                  requestClose={handleClose}
                />
              </Modal>
            </FocusTrap>
          </OverlayCenter>
        </Overlay>
      )}
      {selectedOption === 'edit' && (
        <Overlay open backdrop={<OverlayBackdrop />}>
          <OverlayCenter>
            <FocusTrap
              focusTrapOptions={{
                initialFocus: false,
                onDeactivate: handleClose,
                clickOutsideDeactivates: true,
                escapeDeactivates: stopPropagation,
              }}
            >
              <Modal variant="Surface" size="500">
                <AccountDataEditor
                  type={selectedEvent?.getType()}
                  content={selectedEvent?.getContent()}
                  requestClose={handleClose}
                />
              </Modal>
            </FocusTrap>
          </OverlayCenter>
        </Overlay>
      )}
    </Box>
  );
}

type DeveloperToolsProps = {
  requestClose: () => void;
};
export function DeveloperTools({ requestClose }: DeveloperToolsProps) {
  const mx = useMatrixClient();
  const [developerTools, setDeveloperTools] = useSetting(settingsAtom, 'developerTools');

  return (
    <Page>
      <PageHeader outlined={false}>
        <Box grow="Yes" gap="200">
          <Box grow="Yes" alignItems="Center" gap="200">
            <Text size="H3" truncate>
              Developer Tools
            </Text>
          </Box>
          <Box shrink="No">
            <IconButton onClick={requestClose} variant="Surface">
              <Icon src={Icons.Cross} />
            </IconButton>
          </Box>
        </Box>
      </PageHeader>
      <Box grow="Yes">
        <Scroll hideTrack visibility="Hover">
          <PageContent>
            <Box direction="Column" gap="700">
              <Box direction="Column" gap="100">
                <Text size="L400">Options</Text>
                <SequenceCard
                  className={SequenceCardStyle}
                  variant="SurfaceVariant"
                  direction="Column"
                  gap="400"
                >
                  <SettingTile
                    title="Enable Developer Tools"
                    after={
                      <Switch
                        variant="Primary"
                        value={developerTools}
                        onChange={setDeveloperTools}
                      />
                    }
                  />
                </SequenceCard>
                {developerTools && (
                  <SequenceCard
                    className={SequenceCardStyle}
                    variant="SurfaceVariant"
                    direction="Column"
                    gap="400"
                  >
                    <SettingTile
                      title="Access Token"
                      description="Copy access token to clipboard."
                      after={
                        <Button
                          onClick={() =>
                            copyToClipboard(mx.getAccessToken() ?? '<NO_ACCESS_TOKEN_FOUND>')
                          }
                          variant="Secondary"
                          fill="Soft"
                          size="300"
                          radii="300"
                          outlined
                        >
                          <Text size="B300">Copy</Text>
                        </Button>
                      }
                    />
                  </SequenceCard>
                )}
              </Box>
              {developerTools && <AccountData />}
            </Box>
          </PageContent>
        </Scroll>
      </Box>
    </Page>
  );
}
