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
import { PriceEntry } from '@/types/index';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function getDaysAgo(dateString: string): string {
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

type Props = {
  entries: PriceEntry[];
  onConfirm: (id: number) => void;
  onFlag: (id: number) => void;
  onAddToBasket: (entry: PriceEntry) => void;
};

export default function PriceList({ entries, onConfirm, onFlag, onAddToBasket }: Props) {
  const { colors } = useTheme();
  const s = styles(colors);
  if (entries.length === 0) return null;

  return (
    <View style={s.card}>
      <Text style={s.title}>💰 Price Comparison</Text>
      <Text style={s.freshnessNote}>Showing prices from the last 30 days only</Text>

      {entries.map((entry, index) => {
        const cheapest = index === 0;
        return (
          <View key={entry.id} style={[s.row, cheapest && s.cheapestRow]}>

            <View style={s.rowLeft}>
              {cheapest && (
                <View style={s.cheapestBadge}>
                  <Text style={s.cheapestBadgeText}>★ Cheapest</Text>
                </View>
              )}
              <Text style={[s.storeName, cheapest && s.cheapestStore]}>
                {cheapest ? '🏆 ' : ''}{entry.store_name}
              </Text>
              <Text style={s.meta}>
                {getDaysAgo(entry.created_at)}
                {entry.confirms > 0 ? ` · ✅ ${entry.confirms}` : ''}
                {entry.flags > 0 ? ` · 🚩 ${entry.flags}` : ''}
              </Text>
            </View>

            <View style={s.rowRight}>
              <Text style={[s.price, cheapest && s.cheapestPrice]}>
                €{entry.price.toFixed(2)}
              </Text>
              <View style={s.actions}>
                <TouchableOpacity
                  style={s.confirmBtn}
                  onPress={() => onConfirm(entry.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={s.actionText}>👍</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.flagBtn}
                  onPress={() => onFlag(entry.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={s.actionText}>🚩</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.basketBtn, cheapest && s.basketBtnCheapest]}
                  onPress={() => onAddToBasket(entry)}
                >
                  <Text style={[s.basketBtnText, cheapest && s.basketBtnTextCheapest]}>
                    + Basket
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        );
      })}
    </View>
  );
}

const styles = (c: ReturnType<typeof import('@/hooks/useTheme').useTheme>['colors']) =>
  StyleSheet.create({
    card: { backgroundColor: c.surface, padding: Spacing.lg, borderRadius: Radii.lg, width: '100%', marginBottom: Spacing.md, borderWidth: 0.5, borderColor: c.border },
    title: { fontSize: Typography.heading3, fontWeight: '600', color: c.textPrimary, marginBottom: Spacing.xs },
    freshnessNote: { fontSize: Typography.tiny, color: c.textSecondary, marginBottom: Spacing.md, fontStyle: 'italic' },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 0.5, borderBottomColor: c.border },
    cheapestRow: { backgroundColor: c.greenLight, borderRadius: Radii.sm, paddingHorizontal: Spacing.sm, borderBottomWidth: 0 },
    rowLeft: { flex: 1, gap: 2 },
    cheapestBadge: { backgroundColor: c.primaryGreen, alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radii.pill, marginBottom: 2 },
    cheapestBadgeText: { fontSize: Typography.tiny, color: '#FFFFFF', fontWeight: '600' },
    storeName: { fontSize: Typography.body, color: c.textPrimary, fontWeight: '500' },
    cheapestStore: { color: c.primaryGreen },
    meta: { fontSize: Typography.tiny, color: c.textSecondary, marginTop: 2 },
    rowRight: { alignItems: 'flex-end', gap: Spacing.xs },
    price: { fontSize: Typography.heading3, fontWeight: '600', color: c.textPrimary },
    cheapestPrice: { color: c.primaryGreen },
    actions: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center' },
    confirmBtn: { backgroundColor: c.infoBg, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radii.sm },
    flagBtn: { backgroundColor: c.errorBg, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radii.sm },
    actionText: { fontSize: Typography.caption },
    basketBtn: { backgroundColor: c.surface, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radii.sm, borderWidth: 0.5, borderColor: c.border },
    basketBtnCheapest: { backgroundColor: c.primaryGreen, borderColor: c.primaryGreen },
    basketBtnText: { fontSize: Typography.tiny, color: c.textSecondary, fontWeight: '600' },
    basketBtnTextCheapest: { color: '#FFFFFF' },
  });