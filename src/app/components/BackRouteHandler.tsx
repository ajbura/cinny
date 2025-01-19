import { ReactNode } from 'react';
import { useGoBack } from '../hooks/useGoBack';

type BackRouteHandlerProps = {
  children: (onBack: () => void) => ReactNode;
};
export function BackRouteHandler({ children }: BackRouteHandlerProps) {
  const goBack = useGoBack();
  return children(goBack);
}
