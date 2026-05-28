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
import { Spacing, Typography } from '@/constants/theme';
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
  const { colors } = useTheme();

  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: colors.textPrimary }]}>Price Comparison</Text>

      {entries.map((entry, index) => {
        const isCheapest = index === 0;

        return (
          <Card key={entry.id} variant={isCheapest ? 'highlight' : 'default'} style={styles.card}>
            {/* Rows 1 & 2: two-column layout */}
            <View style={styles.mainRow}>
              {/* Left: StoreBadge */}
              <View style={styles.leftCol}>
                <StoreBadge store={entry.store_name} size="md" />
              </View>

              {/* Right: price + Add button, then Best Price label */}
              <View style={styles.rightCol}>
                <View style={styles.priceAddRow}>
                  <Text style={[styles.price, { color: colors.textPrimary }]}>
                    €{entry.price.toFixed(2)}
                  </Text>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    onPress={() => onAddToBasket(entry)}
                  >
                    Add
                  </Button>
                </View>
                {isCheapest && (
                  <Text style={[styles.bestLabel, { color: colors.primaryGreen }]}>
                    ↘ Best Price
                  </Text>
                )}
              </View>
            </View>

            {/* Row 3: voting buttons + daysAgo */}
            <View style={styles.bottomRow}>
              <Button variant="ghost" size="lg" fullWidth={false} style={styles.voteBtn} onPress={() => onConfirm(entry.id)}>
                <Text style={[styles.voteText, { color: colors.textSecondary }]}>
                  👍{entry.confirms > 0 ? ` ${entry.confirms}` : ''}
                </Text>
              </Button>
              <Button variant="ghost" size="lg" fullWidth={false} style={styles.voteBtn} onPress={() => onFlag(entry.id)}>
                <Text style={[styles.voteText, { color: colors.textSecondary }]}>
                  🚩{entry.flags > 0 ? ` ${entry.flags}` : ''}
                </Text>
              </Button>
              <Text style={[styles.ageText, { color: colors.textSecondary }]}>
                {getDaysAgo(entry.created_at)}
              </Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: Spacing.xs },
  heading: {
    fontSize: Typography.heading2,
    fontWeight: Typography.bold,
    fontFamily: 'Inter',
    marginBottom: Spacing.sm,
  },
  card: { marginBottom: Spacing.sm },

  // Rows 1 & 2
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  leftCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  priceAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  price: {
    fontSize: Typography.heading1,
    fontWeight: Typography.bold,
    fontFamily: 'Inter',
  },
  bestLabel: {
    fontSize: Typography.body,
    fontWeight: Typography.bold,
    fontFamily: 'Inter',
    marginTop: Spacing.xs,
  },

  // Row 3
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  voteText: {
    fontSize: Typography.body,
    fontFamily: 'Inter',
  },
  voteBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  ageText: {
    fontSize: Typography.body,
    fontFamily: 'Inter',
    marginLeft: 'auto',
  },
});
