import React, { ReactNode } from 'react';
import { AuthDict, AuthType, IAuthData, UIAFlow } from 'matrix-js-sdk';
import { getUIAFlowForStages } from '../utils/matrix-uia';
import { useSupportedUIAFlows, useUIACompleted, useUIAFlow } from '../hooks/useUIAFlows';
import { UIAFlowOverlay } from './UIAFlowOverlay';
import { PasswordStage } from './uia-stages';

export const SUPPORTED_IN_APP_UIA_STAGES = [AuthType.Password, AuthType.Sso];

export const pickUIAFlow = (uiaFlows: UIAFlow[]): UIAFlow | undefined => {
  const passwordFlow = getUIAFlowForStages(uiaFlows, [AuthType.Password]);
  if (passwordFlow) return passwordFlow;
  return getUIAFlowForStages(uiaFlows, [AuthType.Sso]);
};

type ActionUIAProps = {
  userId: string;
  authData: IAuthData;
  ongoingFlow: UIAFlow;
  action: (authDict: AuthDict) => void;
  onCancel: () => void;
};
export function ActionUIA({ userId, authData, ongoingFlow, action, onCancel }: ActionUIAProps) {
  const completed = useUIACompleted(authData);
  const { getStageToComplete } = useUIAFlow(authData, ongoingFlow);

  const stageToComplete = getStageToComplete();

  if (!stageToComplete) return null;
  return (
    <UIAFlowOverlay
      currentStep={completed.length + 1}
      stepCount={ongoingFlow.stages.length}
      onCancel={onCancel}
    >
      {stageToComplete.type === AuthType.Password && (
        <PasswordStage
          userId={userId}
          stageData={stageToComplete}
          onCancel={onCancel}
          submitAuthDict={action}
        />
      )}
    </UIAFlowOverlay>
  );
}

type ActionUIAFlowsLoaderProps = {
  authData: IAuthData;
  unsupported: () => ReactNode;
  children: (ongoingFlow: UIAFlow) => ReactNode;
};
export function ActionUIAFlowsLoader({
  authData,
  unsupported,
  children,
}: ActionUIAFlowsLoaderProps) {
  const supportedFlows = useSupportedUIAFlows(authData.flows ?? [], SUPPORTED_IN_APP_UIA_STAGES);
  const ongoingFlow = supportedFlows.length > 0 ? supportedFlows[0] : undefined;

  if (!ongoingFlow) return unsupported();

  return children(ongoingFlow);
}
