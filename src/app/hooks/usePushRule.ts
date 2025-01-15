import {
  IPushRule,
  IPushRules,
  PushRuleAction,
  PushRuleCondition,
  PushRuleKind,
  RuleId,
} from 'matrix-js-sdk';
import { useMemo } from 'react';

export type PushRuleData = {
  kind: PushRuleKind;
  pushRule: IPushRule;
};

export const makePushRuleData = (
  kind: PushRuleKind,
  ruleId: RuleId,
  actions: PushRuleAction[],
  conditions?: PushRuleCondition[],
  pattern?: string,
  enabled?: boolean,
  _default?: boolean
): PushRuleData => ({
  kind,
  pushRule: {
    rule_id: ruleId,
    default: _default ?? true,
    enabled: enabled ?? true,
    pattern,
    conditions,
    actions,
  },
});

export const orderedPushRuleKinds: PushRuleKind[] = [
  PushRuleKind.Override,
  PushRuleKind.ContentSpecific,
  PushRuleKind.RoomSpecific,
  PushRuleKind.SenderSpecific,
  PushRuleKind.Underride,
];

export const getPushRule = (
  pushRules: IPushRules,
  ruleId: RuleId | string
): PushRuleData | undefined => {
  const { global } = pushRules;

  let ruleData: PushRuleData | undefined;

  orderedPushRuleKinds.some((kind) => {
    const rules = global[kind];
    const pushRule = rules?.find((r) => r.rule_id === ruleId);
    if (pushRule) {
      ruleData = {
        kind,
        pushRule,
      };
      return true;
    }
    return false;
  });

  return ruleData;
};

export const usePushRule = (
  pushRules: IPushRules,
  ruleId: RuleId | string
): PushRuleData | undefined => useMemo(() => getPushRule(pushRules, ruleId), [pushRules, ruleId]);
