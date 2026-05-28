// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Tralaí Cliste — Irish community grocery price comparison app
// Copyright (C) 2026 Tralaí Cliste Contributors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Radii, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type Size = 'sm' | 'md';

interface StoreBadgeProps {
  store: string;
  size?: Size;
}

type BadgeColour = { bg: string; text: string };

const LIGHT_COLOURS: Record<string, BadgeColour> = {
  'Lidl':          { bg: '#FFF3CD', text: '#7A5C00' },
  'Aldi':          { bg: '#D0E8FF', text: '#003A7A' },
  'Tesco':         { bg: '#CCE0FF', text: '#003DA5' },
  'SuperValu':     { bg: '#FFE4CC', text: '#A63200' },
  'Dunnes Stores': { bg: '#FFD6D6', text: '#A50000' },
};

const DARK_COLOURS: Record<string, BadgeColour> = {
  'Lidl':          { bg: '#3D3200', text: '#FFD966' },
  'Aldi':          { bg: '#002D5C', text: '#66B3FF' },
  'Tesco':         { bg: '#002966', text: '#80AAFF' },
  'SuperValu':     { bg: '#4D1A00', text: '#FF9966' },
  'Dunnes Stores': { bg: '#4D0000', text: '#FF8080' },
};

export function StoreBadge({ store, size = 'md' }: StoreBadgeProps) {
  const { colors, isDark } = useTheme();
  const palette = isDark ? DARK_COLOURS : LIGHT_COLOURS;
  const { bg, text } = palette[store] ?? { bg: colors.greenLight, text: colors.primaryGreen };

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[
        styles.label,
        { fontSize: size === 'sm' ? Typography.tiny : Typography.body, color: text },
      ]}>
        {store}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  label: {
    fontFamily: 'Inter',
    fontWeight: Typography.semibold,
  },
});
