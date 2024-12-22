import React, { FormEventHandler, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import {
  Box,
  Button,
  Dialog,
  Header,
  Icon,
  IconButton,
  Icons,
  Input,
  Overlay,
  OverlayBackdrop,
  OverlayCenter,
  Text,
  config,
} from 'folds';
import { stopPropagation } from '../../../utils/keyboard';

type RectCords = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type LimitButtonProps = {
  limit: number;
  onLimitChange: (limit: string) => void;
  setMenuAnchor: React.Dispatch<React.SetStateAction<RectCords | undefined>>;
};

export function LimitWarning({ limit, onLimitChange, setMenuAnchor }: LimitButtonProps) {
  const [dialog, setDialog] = useState(false);
  const [xlimit, setXLimit] = useState<number>(limit);

  const checklimit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();
    const limitInput = evt.currentTarget.limitInput as HTMLInputElement;
    if (!limitInput) return;
    const newLimit = limitInput.value.trim();
    if (!newLimit) return;
    if (parseInt(newLimit, 10) > 9999) {
      setDialog(true);
      setXLimit(Number(newLimit));
    } else {
      onLimitChange(newLimit);
      setMenuAnchor(undefined);
    }
  };

  const handleLimitSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();
    onLimitChange(xlimit.toString());
    setDialog(false);
    setMenuAnchor(undefined);
  };

  return (
    <>
      <Overlay open={dialog} backdrop={<OverlayBackdrop />}>
        <OverlayCenter>
          <FocusTrap
            focusTrapOptions={{
              initialFocus: false,
              clickOutsideDeactivates: true,
              onDeactivate: () => setDialog(false),
              escapeDeactivates: stopPropagation,
            }}
          >
            <Dialog variant="Surface">
              <Header
                style={{
                  padding: `0 ${config.space.S200} 0 ${config.space.S400}`,
                  borderBottomWidth: config.borderWidth.B300,
                }}
                variant="Surface"
                size="500"
              >
                <Box grow="Yes">
                  <Text size="H4">Warning!!</Text>
                </Box>
                <IconButton size="300" onClick={() => setDialog(false)} radii="300">
                  <Icon src={Icons.Cross} />
                </IconButton>
              </Header>
              <Box
                as="form"
                onSubmit={handleLimitSubmit}
                style={{ padding: config.space.S400 }}
                direction="Column"
                gap="400"
              >
                <Text priority="400">
                  You are about to change the limit of items per page. Changing the limit higher
                  than 9,999 may cause performance issues and may crash the app. It is recommended
                  to keep the limit below 9,999 for the smooth functioning of the app. Are you sure
                  you want to continue?
                </Text>
                <Box direction="Column" gap="200">
                  <Button
                    type="button"
                    onClick={() => setDialog(false)}
                    variant="Secondary"
                    fill="Soft"
                  >
                    <Text size="B300">No</Text>
                  </Button>
                  <Button type="submit" variant="Secondary" fill="Soft">
                    <Text size="B300">Continue</Text>
                  </Button>
                </Box>
              </Box>
            </Dialog>
          </FocusTrap>
        </OverlayCenter>
      </Overlay>
      <Box as="form" onSubmit={checklimit} direction="Column" gap="300">
        <Box direction="Column" gap="100">
          <Text size="L400">Custom Limit</Text>
          <Input
            name="limitInput"
            size="300"
            variant="Background"
            defaultValue={limit}
            min={1}
            step={1}
            outlined
            type="number"
            radii="400"
            aria-label="Per Page Item Limit"
          />
        </Box>
        <Button type="submit" size="300" variant="Primary" radii="400">
          <Text size="B300">Change Limit</Text>
        </Button>
      </Box>
    </>
  );
}
