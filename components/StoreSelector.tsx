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
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  stores: string[];
  selectedStore: string;
  onSelect: (store: string) => void;
};

export default function StoreSelector({ stores, selectedStore, onSelect }: Props) {
  const { colors } = useTheme();
  const s = styles(colors);
  return (
    <>
      <Text style={s.label}>Which store?</Text>
      <View style={s.row}>
        {stores.map(store => (
          <TouchableOpacity
            key={store}
            style={[s.pill, selectedStore === store && s.pillSelected]}
            onPress={() => onSelect(store)}
            activeOpacity={0.8}
          >
            <Text style={[s.pillText, selectedStore === store && s.pillTextSelected]}>
              {store}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

const styles = (c: ReturnType<typeof import('@/hooks/useTheme').useTheme>['colors']) =>
  StyleSheet.create({
    label: { fontSize: Typography.body, fontWeight: '500', color: c.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
    pill: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radii.pill, borderWidth: 0.5, borderColor: c.border, backgroundColor: c.surface, minHeight: 36 },
    pillSelected: { backgroundColor: c.greenLight, borderColor: c.primaryGreen },
    pillText: { fontSize: Typography.bodySmall, color: c.textPrimary },
    pillTextSelected: { color: c.primaryGreen, fontWeight: '600' },
  });
