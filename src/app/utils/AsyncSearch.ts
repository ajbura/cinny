export type NormalizeOption = {
  caseSensitive?: boolean;
  normalizeUnicode?: boolean;
  ignoreWhitespace?: boolean;
};

export type MatchQueryOption = {
  contain?: boolean;
};

export type AsyncSearchOption = {
  limit?: number;
};

export type MatchHandler<TSearchItem extends object | string | number> = (
  item: TSearchItem,
  query: string
) => boolean;
export type ResultHandler<TSearchItem extends object | string | number> = (
  results: TSearchItem[],
  query: string
) => void;

export type AsyncSearchHandler = (query: string) => void;

export const normalize = (str: string, options?: NormalizeOption) => {
  let nStr = str.normalize(options?.normalizeUnicode ?? true ? 'NFKC' : 'NFC');
  if (!options?.caseSensitive) nStr = nStr.toLocaleLowerCase();
  if (options?.ignoreWhitespace ?? true) nStr = nStr.replace(/\s/g, '');
  return nStr;
};

export const matchQuery = (item: string, query: string, options?: MatchQueryOption): boolean => {
  if (options?.contain) return item.indexOf(query) !== -1;
  return item.startsWith(query);
};

export const AsyncSearch = <TSearchItem extends object | string | number>(
  list: TSearchItem[],
  match: MatchHandler<TSearchItem>,
  onResult: ResultHandler<TSearchItem>,
  options?: AsyncSearchOption
): AsyncSearchHandler => {
  let resultList: TSearchItem[] = [];

  let searchUptoIndex = 0;
  let sessionStartTimestamp = 0;
  let sessionScheduleId: number | undefined;

  const sessionReset = () => {
    resultList = [];
    searchUptoIndex = 0;
    sessionStartTimestamp = 0;
    if (sessionScheduleId) clearTimeout(sessionScheduleId);
    sessionScheduleId = undefined;
  };

  const find = (query: string, sessionTimestamp: number, lastFindingCount: number) => {
    sessionScheduleId = undefined;
    // return if find session got reset
    if (sessionTimestamp !== sessionStartTimestamp) return;

    sessionStartTimestamp = window.performance.now();
    for (let searchIndex = searchUptoIndex; searchIndex < list.length; searchIndex += 1) {
      if (match(list[searchIndex], query)) {
        resultList.push(list[searchIndex]);
        if (typeof options?.limit === 'number' && resultList.length >= options.limit) {
          break;
        }
      }

      const matchFinishTime = window.performance.now();
      if (matchFinishTime - sessionStartTimestamp > 8) {
        const thisFindingCount = resultList.length;
        const thisSessionTimestamp = sessionStartTimestamp;
        if (lastFindingCount !== thisFindingCount) onResult(resultList, query);

        searchUptoIndex = searchIndex + 1;
        sessionScheduleId = window.setTimeout(
          () => find(query, thisSessionTimestamp, thisFindingCount),
          1
        );
        return;
      }
    }

    if (lastFindingCount !== resultList.length || lastFindingCount === 0) {
      onResult(resultList, query);
    }
    sessionReset();
  };

  const search = (query: string) => {
    sessionReset();
    if (query === '') {
      onResult(resultList, query);
      return;
    }
    find(query, sessionStartTimestamp, searchUptoIndex);
  };

  return search;
};