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

import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { Product } from '@/types/index';
import { Image, StyleSheet, Text, View } from 'react-native';

type Props = { product: Product };

export default function ProductSummary({ product }: Props) {
  const { colors, typography, spacing, radii } = useTheme();

  const styles = StyleSheet.create({
    card: { width: '100%', marginBottom: spacing.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    image: { width: 64, height: 64, borderRadius: radii.sm, resizeMode: 'contain' },
    imageFallback: { width: 64, height: 64, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
    fallbackEmoji: { fontSize: 28 },
    info: { flex: 1, gap: 2 },
    name: { fontSize: typography.heading3, fontWeight: '600', fontFamily: 'Inter' },
    meta: { fontSize: typography.bodySmall, fontFamily: 'Inter' },
  });

  return (
    <Card variant="default" style={styles.card}>
      <View style={styles.row}>
        {product.image_url
          ? <Image source={{ uri: product.image_url }} style={styles.image} />
          : (
            <View style={[styles.imageFallback, { backgroundColor: colors.greenLight }]}>
              <Text style={styles.fallbackEmoji}>🛒</Text>
            </View>
          )
        }

        <View style={styles.info}>
          <Text
            style={[styles.name, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {product.product_name || 'Unknown product'}
          </Text>
          {!!product.brands && (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {product.brands}
            </Text>
          )}
          {!!product.quantity && (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {product.quantity}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
}
