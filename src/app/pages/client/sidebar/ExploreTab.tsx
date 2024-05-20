import React from 'react';
import { Icon, Icons } from 'folds';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { SidebarAvatar, SidebarItem, SidebarItemTooltip } from '../../../components/sidebar';
import { useExploreSelected } from '../../../hooks/router/useExploreSelected';
import {
  getExploreFeaturedPath,
  getExplorePath,
  getExploreServerPath,
  joinPathComponent,
} from '../../pathUtils';
import { navToActivePathAtom } from '../../../state/navToActivePath';
import { useClientConfig } from '../../../hooks/useClientConfig';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { getMxIdServer } from '../../../utils/matrix';

export function ExploreTab() {
  const mx = useMatrixClient();
  const clientConfig = useClientConfig();
  const navigate = useNavigate();
  const navToActivePath = useAtomValue(navToActivePathAtom);

  const exploreSelected = useExploreSelected();

  const handleExploreClick = () => {
    const activePath = navToActivePath.get('explore');
    if (activePath) {
      navigate(joinPathComponent(activePath));
      return;
    }

    if (clientConfig.featuredCommunities?.openAsDefault) {
      navigate(getExploreFeaturedPath());
      return;
    }
    const userId = mx.getUserId();
    const userServer = userId ? getMxIdServer(userId) : undefined;
    if (userServer) {
      navigate(getExploreServerPath(userServer));
      return;
    }
    navigate(getExplorePath());
  };

  return (
    <SidebarItem active={exploreSelected}>
      <SidebarItemTooltip tooltip="Explore Community">
        {(triggerRef) => (
          <SidebarAvatar as="button" ref={triggerRef} outlined onClick={handleExploreClick}>
            <Icon src={Icons.Explore} filled={exploreSelected} />
          </SidebarAvatar>
        )}
      </SidebarItemTooltip>
    </SidebarItem>
  );
}
