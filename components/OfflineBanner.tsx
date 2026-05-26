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

import { Radii, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { StyleSheet, Text, View } from 'react-native';

type Props = { isOnline: boolean };

export default function OfflineBanner({ isOnline }: Props) {
  const { colors } = useTheme();
  if (isOnline) return null;
  return (
    <View style={styles(colors).banner}>
      <Text style={styles(colors).text}>
        📡 You're offline — showing cached data
      </Text>
    </View>
  );
}

const styles = (c: ReturnType<typeof import('@/hooks/useTheme').useTheme>['colors']) =>
  StyleSheet.create({
    banner: { backgroundColor: c.accentGold, padding: Spacing.sm, borderRadius: Radii.sm, width: '100%', marginBottom: Spacing.md },
    text: { color: '#1A1C1E', textAlign: 'center', fontSize: Typography.bodySmall, fontWeight: '600' },
  });
