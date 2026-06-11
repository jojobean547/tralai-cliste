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

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StoreBadge } from '@/components/ui/StoreBadge';
import { useTheme } from '@/hooks/useTheme';
import { PriceEntry } from '@/types/index';
import { StyleSheet, Text, View } from 'react-native';

function getDaysAgo(dateString: string): string {
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

type Props = {
  entries: PriceEntry[];
  onConfirm: (id: number) => void;
  onFlag: (id: number) => void;
  onAddToBasket: (entry: PriceEntry) => void;
};

export default function PriceList({ entries, onConfirm, onFlag, onAddToBasket }: Props) {
  const { colors, typography, spacing, radii } = useTheme();

  if (entries.length === 0) return null;

  const styles = StyleSheet.create({
    container: { width: '100%', marginBottom: spacing.xs },
    heading: {
      fontSize: typography.heading2,
      fontWeight: typography.bold,
      fontFamily: 'Inter',
      marginBottom: spacing.sm,
    },
    card: { marginBottom: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    
    storeRow: { marginBottom: spacing.xs },

    mainRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftCol:  { flex: 1, alignItems: 'flex-start', justifyContent: 'center', gap: spacing.xs },
    rightCol: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    price:    { fontSize: typography.heading1, fontWeight: typography.bold, fontFamily: 'Inter' },

    voteRow: { flexDirection: 'row', alignItems: 'center' },
    voteText: { fontSize: typography.body, fontFamily: 'Inter' },
    voteBtn:  { paddingHorizontal: spacing.xs, paddingVertical: 0 },
    ageText:  { fontSize: typography.tiny, fontFamily: 'Inter' },
    addBtn:   { alignSelf: 'center' },
    addLabel: { fontSize: typography.bodySmall, fontWeight: '700', fontFamily: 'Inter' },
    clubCardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: 'rgba(242, 183, 5, 0.15)',
      borderRadius: radii.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    clubCardPrice: { fontSize: typography.heading1, fontWeight: '700', fontFamily: 'Inter' },
    dealBadge: {
      backgroundColor: 'rgba(242, 183, 5, 0.15)',
      borderRadius: radii.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    dealBadgeText: { fontSize: typography.tiny, fontWeight: '700', fontFamily: 'Inter' },
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: colors.textPrimary }]}>Price Comparison</Text>

      {entries.map((entry, index) => {
        const isCheapest = index === 0;

        return (
          <Card key={entry.id} variant={isCheapest ? 'highlight' : 'default'} style={styles.card}>

            {/* NEW: store badge on its own row */}
            <View style={styles.storeRow}>
              <StoreBadge store={entry.store_name} size="md" />
            </View>

            <View style={styles.mainRow}>
              <View style={styles.leftCol}>
                <Text style={[styles.ageText, { color: colors.textSecondary }]}>
                  {getDaysAgo(entry.created_at)}
                </Text>
                <View style={styles.voteRow}>
                  <Button variant="ghost" size="sm" fullWidth={false} style={styles.voteBtn} onPress={() => onConfirm(entry.id)}>
                    <Text style={[styles.voteText, { color: colors.textSecondary }]}>
                      👍{entry.confirms > 0 ? ` ${entry.confirms}` : ''}
                    </Text>
                  </Button>
                  <Button variant="ghost" size="sm" fullWidth={false} style={styles.voteBtn} onPress={() => onFlag(entry.id)}>
                    <Text style={[styles.voteText, { color: colors.textSecondary }]}>
                      🚩{entry.flags > 0 ? ` ${entry.flags}` : ''}
                    </Text>
                  </Button>
                </View>
              </View>

              <View style={styles.rightCol}>
                {!!entry.deal && (
                  <View style={styles.dealBadge}>
                    <Text style={[styles.dealBadgeText, { color: colors.accentGold }]}>🏷️ {entry.deal}</Text>
                  </View>
                )}
                {entry.club_card_price != null && (
                  <View style={styles.clubCardRow}>
                    <Text style={[styles.clubCardPrice, { color: colors.accentGold }]}>
                      💳 €{entry.club_card_price.toFixed(2)}
                    </Text>
                  </View>
                )}
                <Text style={[styles.price, { color: colors.textPrimary }]}>
                  €{entry.price.toFixed(2)}
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth={false}
                  onPress={() => onAddToBasket(entry)}
                  style={[styles.addBtn, { backgroundColor: colors.greenTintBg, borderWidth: 2, borderColor: colors.greenTintText }]}
                >
                  <Text style={[styles.addLabel, { color: colors.greenTintText }]}>Add</Text>
                </Button>
              </View>
            </View>
          </Card>
        );
      })}
    </View>
  );
}
