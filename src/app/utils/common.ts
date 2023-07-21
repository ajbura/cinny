import { IconName, IconSrc } from 'folds';

export const bytesToSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0KB';

  let sizeIndex = Math.floor(Math.log(bytes) / Math.log(1000));

  if (sizeIndex === 0) sizeIndex = 1;

  return `${(bytes / 1000 ** sizeIndex).toFixed(1)} ${sizes[sizeIndex]}`;
};

export const getFileTypeIcon = (icons: Record<IconName, IconSrc>, fileType: string): IconSrc => {
  const type = fileType.toLowerCase();
  if (type.startsWith('audio')) {
    return icons.Play;
  }
  if (type.startsWith('video')) {
    return icons.Vlc;
  }
  if (type.startsWith('image')) {
    return icons.Photo;
  }
  return icons.File;
};

export const fulfilledPromiseSettledResult = <T>(prs: PromiseSettledResult<T>[]): T[] =>
  prs.reduce<T[]>((values, pr) => {
    if (pr.status === 'fulfilled') values.push(pr.value);
    return values;
  }, []);

export const binarySearch = <T>(items: T[], match: (item: T) => -1 | 0 | 1): T | undefined => {
  const search = (start: number, end: number): T | undefined => {
    if (start > end) return undefined;

    const mid = Math.floor((start + end) / 2);

    const result = match(items[mid]);
    if (result === 0) return items[mid];

    if (result === 1) return search(start, mid - 1);
    return search(mid + 1, end);
  };

  return search(0, items.length - 1);
};
