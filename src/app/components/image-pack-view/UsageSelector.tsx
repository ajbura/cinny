import React, { useMemo } from 'react';
import { Box, config, MenuItem, Text } from 'folds';
import { ImageUsage } from '../../plugins/custom-emoji';

export const useUsageStr = (): ((usage: ImageUsage[]) => string) => {
  const getUsageStr = (usage: ImageUsage[]): string => {
    const sticker = usage.includes(ImageUsage.Sticker);
    const emoticon = usage.includes(ImageUsage.Emoticon);

    if (sticker && emoticon) return 'Both';
    if (sticker) return 'Sticker';
    if (emoticon) return 'Emoji';
    return 'Both';
  };
  return getUsageStr;
};

type UsageSelectorProps = {
  selected: ImageUsage[];
  onChange: (usage: ImageUsage[]) => void;
};
export function UsageSelector({ selected, onChange }: UsageSelectorProps) {
  const getUsageStr = useUsageStr();

  const selectedUsageStr = getUsageStr(selected);
  const isSelected = (usage: ImageUsage[]) => getUsageStr(usage) === selectedUsageStr;

  const allUsages: ImageUsage[][] = useMemo(
    () => [[ImageUsage.Emoticon], [ImageUsage.Sticker], [ImageUsage.Sticker, ImageUsage.Emoticon]],
    []
  );

  return (
    <Box direction="Column" gap="100" style={{ padding: config.space.S100 }}>
      {allUsages.map((usage) => (
        <MenuItem
          key={getUsageStr(usage)}
          size="300"
          variant={isSelected(usage) ? 'SurfaceVariant' : 'Surface'}
          aria-selected={isSelected(usage)}
          radii="300"
          onClick={() => onChange(usage)}
        >
          <Box grow="Yes">
            <Text size="T300">{getUsageStr(usage)}</Text>
          </Box>
        </MenuItem>
      ))}
    </Box>
  );
}
