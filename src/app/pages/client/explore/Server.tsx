import React, { FormEventHandler, MouseEventHandler, useCallback, useMemo, useRef } from 'react';
import { Box, Button, Chip, Icon, Icons, Input, Spinner, Text } from 'folds';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MatrixClient, Method, RoomType } from 'matrix-js-sdk';
import { Content, ContentHeroSection, ContentHero, ContentBody } from '../../../components/content';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { RoomTopicViewer } from '../../../components/room-topic-viewer';
import { RoomCard, RoomCardGrid } from '../../../components/room-card';
import { ExploreServerPathSearchParams } from '../../paths';
import { getExploreServerPath, withSearchParam } from '../../pathUtils';

const getServerSearchParams = (searchParams: URLSearchParams): ExploreServerPathSearchParams => ({
  limit: searchParams.get('limit') ?? undefined,
  since: searchParams.get('since') ?? undefined,
  term: searchParams.get('term') ?? undefined,
  type: searchParams.get('type') ?? undefined,
});

type RoomTypeFilter = {
  title: string;
  value: string | undefined;
};
const useRoomTypeFilters = (): RoomTypeFilter[] =>
  useMemo(
    () => [
      {
        title: 'All',
        value: undefined,
      },
      {
        title: 'Spaces',
        value: RoomType.Space,
      },
      {
        title: 'Rooms',
        value: 'null',
      },
    ],
    []
  );

const FALLBACK_ROOMS_LIMIT = 24;

export function PublicRooms() {
  const { server } = useParams();
  const mx = useMatrixClient();
  const [searchParams] = useSearchParams();
  const serverSearchParams = getServerSearchParams(searchParams);
  const isSearch = serverSearchParams.term;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const roomTypeFilters = useRoomTypeFilters();

  const fetchPublicRooms = useCallback(() => {
    const limit =
      typeof serverSearchParams.limit === 'string'
        ? parseInt(serverSearchParams.limit, 10)
        : FALLBACK_ROOMS_LIMIT;
    const roomType: string | null | undefined =
      serverSearchParams.type === 'null' ? null : serverSearchParams.type;

    return mx.http.authedRequest<Awaited<ReturnType<MatrixClient['publicRooms']>>>(
      Method.Post,
      '/publicRooms',
      {
        server,
      },
      {
        limit,
        since: serverSearchParams.since,
        filter: {
          generic_search_term: serverSearchParams.term,
          room_types: roomType !== undefined ? [roomType] : undefined,
        },
      }
    );
  }, [mx, server, serverSearchParams]);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      server,
      'publicRooms',
      serverSearchParams.limit,
      serverSearchParams.since,
      serverSearchParams.term,
      serverSearchParams.type,
    ],
    queryFn: fetchPublicRooms,
  });

  const explore = (newSearchParams: ExploreServerPathSearchParams) => {
    if (!server) return;

    const sParams: Record<string, string> = {
      ...serverSearchParams,
      ...newSearchParams,
    };
    Object.keys(sParams).forEach((key) => {
      if (sParams[key] === undefined) delete sParams[key];
    });
    const path = withSearchParam(getExploreServerPath(server), sParams);
    navigate(path);
  };

  const paginateBack = () => {
    const token = data?.prev_batch;
    explore({ since: token });
  };

  const paginateFront = () => {
    const token = data?.next_batch;
    explore({ since: token });
  };

  const handleSearchSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();
    const { searchInput } = evt.target as HTMLFormElement & {
      searchInput: HTMLInputElement;
    };

    const searchTerm = searchInput.value.trim() || undefined;
    explore({
      term: searchTerm,
      since: undefined,
    });
  };

  const handleSearchClear = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    explore({
      term: undefined,
      since: undefined,
    });
  };

  const handleRoomFilterClick: MouseEventHandler<HTMLButtonElement> = (evt) => {
    const filter = evt.currentTarget.getAttribute('data-room-filter');
    explore({
      type: filter ?? undefined,
      since: undefined,
    });
  };

  return (
    <Content>
      <Box direction="Column" gap="200">
        <ContentHeroSection direction="Column" gap="400">
          <ContentHero
            icon={<Icon size="600" src={Icons.Category} />}
            title={server}
            subTitle={`Find and explore public rooms and spaces on ${server} server.`}
          />
        </ContentHeroSection>
        <ContentBody>
          <Box direction="Column" gap="700">
            <Box direction="Column" gap="400">
              <Box direction="Column" gap="300">
                {isSearch ? (
                  <Text size="H4">{`Public Communities for "${serverSearchParams.term}"`}</Text>
                ) : (
                  <Text size="H4">Public Community</Text>
                )}
                <form onSubmit={handleSearchSubmit}>
                  <Input
                    ref={searchInputRef}
                    name="searchInput"
                    size="500"
                    variant="Background"
                    placeholder="Search"
                    before={
                      isSearch && isLoading ? (
                        <Spinner variant="Secondary" size="200" />
                      ) : (
                        <Icon size="200" src={Icons.Search} />
                      )
                    }
                    after={
                      isSearch && (
                        <Chip
                          type="button"
                          variant="Secondary"
                          size="400"
                          radii="Pill"
                          aria-pressed
                          after={<Icon size="50" src={Icons.Cross} />}
                          onClick={handleSearchClear}
                        >
                          <Text size="B300">Clear</Text>
                        </Chip>
                      )
                    }
                  />
                </form>
                <Box gap="200">
                  {roomTypeFilters.map((filter) => (
                    <Chip
                      key={filter.title}
                      onClick={handleRoomFilterClick}
                      data-room-filter={filter.value}
                      variant={filter.value === serverSearchParams.type ? 'Success' : 'Surface'}
                      aria-pressed={filter.value === serverSearchParams.type}
                      before={
                        filter.value === serverSearchParams.type && (
                          <Icon size="100" src={Icons.Check} />
                        )
                      }
                      outlined
                    >
                      <Text size="T200">{filter.title}</Text>
                    </Chip>
                  ))}
                </Box>
              </Box>
              {isLoading && !error && <Text>loading...</Text>}
              {error && <Text>{error.message}</Text>}
              <RoomCardGrid>
                {data?.chunk.map((chunkRoom) => (
                  <RoomCard
                    key={chunkRoom.room_id}
                    roomIdOrAlias={chunkRoom.canonical_alias ?? chunkRoom.room_id}
                    joinedRoomId={mx.getRoom(chunkRoom.room_id)?.roomId}
                    avatarUrl={chunkRoom.avatar_url}
                    name={chunkRoom.name}
                    topic={chunkRoom.topic}
                    memberCount={chunkRoom.num_joined_members}
                    roomType={chunkRoom.room_type}
                    renderTopicViewer={(name, topic, requestClose) => (
                      <RoomTopicViewer name={name} topic={topic} requestClose={requestClose} />
                    )}
                  />
                ))}
              </RoomCardGrid>
              {data && (
                <>
                  <span data-spacing-node />
                  <Box justifyContent="Center" gap="200">
                    <Chip radii="Pill" size="500" variant="SurfaceVariant">
                      <Text size="B300" truncate>{`Page Limit: ${data.chunk.length}`}</Text>
                    </Chip>
                    <Box data-spacing-node grow="Yes" />
                    <Button
                      onClick={paginateBack}
                      size="300"
                      fill="Soft"
                      disabled={!data.prev_batch}
                    >
                      <Text size="B300" truncate>
                        Previous Page
                      </Text>
                    </Button>
                    <Button
                      onClick={paginateFront}
                      size="300"
                      fill="Solid"
                      disabled={!data.next_batch}
                    >
                      <Text size="B300" truncate>
                        Next Page
                      </Text>
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </ContentBody>
      </Box>
    </Content>
  );
}