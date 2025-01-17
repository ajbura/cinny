import { PushRuleAction, PushRuleActionName, TweakName } from 'matrix-js-sdk';
import { useCallback, useMemo } from 'react';

export enum NotificationMode {
  OFF = 'OFF',
  Notify = 'Notify',
  NotifyLoud = 'NotifyLoud',
}

export type NotificationModeOptions = {
  soundValue?: string;
  highlight?: boolean;
};
export const getNotificationModeActions = (
  mode: NotificationMode,
  options?: NotificationModeOptions
): PushRuleAction[] => {
  if (mode === NotificationMode.OFF) return [];

  const actions: PushRuleAction[] = [PushRuleActionName.Notify];

  if (mode === NotificationMode.NotifyLoud) {
    actions.push({
      set_tweak: TweakName.Sound,
      value: options?.soundValue ?? 'default',
    });
  }

  if (options?.highlight) {
    actions.push({
      set_tweak: TweakName.Highlight,
      value: true,
    });
  }

  return actions;
};

export type GetNotificationModeCallback = (mode: NotificationMode) => PushRuleAction[];
export const useNotificationModeActions = (
  options?: NotificationModeOptions
): GetNotificationModeCallback => {
  const getAction: GetNotificationModeCallback = useCallback(
    (mode) => getNotificationModeActions(mode, options),
    [options]
  );

  return getAction;
};

export const useNotificationActionsMode = (actions: PushRuleAction[]): NotificationMode => {
  const mode: NotificationMode = useMemo(() => {
    const soundTweak = actions.find(
      (action) => typeof action === 'object' && action.set_tweak === TweakName.Sound
    );
    const notify = actions.find(
      (action) => typeof action === 'string' && action === PushRuleActionName.Notify
    );

    if (notify && soundTweak) return NotificationMode.NotifyLoud;
    if (notify) return NotificationMode.Notify;
    return NotificationMode.OFF;
  }, [actions]);

  return mode;
};
