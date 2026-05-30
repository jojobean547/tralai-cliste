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

import { StoreBadge } from '@/components/ui/StoreBadge';
import { useTheme } from '@/hooks/useTheme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  stores: string[];
  selectedStore: string;
  onSelect: (store: string) => void;
};

export default function StoreSelector({ stores, selectedStore, onSelect }: Props) {
  const { colors, typography, spacing, radii } = useTheme();

  const styles = StyleSheet.create({
    label: { fontSize: typography.body, fontWeight: '500', marginBottom: spacing.sm, marginTop: spacing.md },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    selectionRing: { borderWidth: 2, borderRadius: radii.pill },
  });

  return (
    <>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Which store?</Text>
      <View style={styles.row}>
        {stores.map(store => {
          const isSelected = selectedStore === store;
          return (
            <TouchableOpacity key={store} onPress={() => onSelect(store)} activeOpacity={0.8}>
              <View style={[styles.selectionRing, { borderColor: isSelected ? colors.primaryGreen : 'transparent' }]}>
                <StoreBadge store={store} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
