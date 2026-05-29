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

import StoreSelector from '@/components/StoreSelector';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { STORES } from '@/constants/stores';
import { Radii, Spacing, TouchTargets, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Product } from '@/types/index';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  product: Product;
  price: string;
  onPriceChange: (p: string) => void;
  onScanTag: () => void;
  aiLoading: boolean;
  selectedStore: string;
  onStoreSelect: (s: string) => void;
  onSubmit: () => void;
  saving: boolean;
};

export default function ProductCard({
  product, price, onPriceChange, onScanTag,
  aiLoading, selectedStore, onStoreSelect, onSubmit, saving,
}: Props) {
  const { colors } = useTheme();

  return (
    <Card style={styles.cardSpacing}>
      {!!product.image_url && (
        <Image source={{ uri: product.image_url }} style={styles.image} />
      )}
      <Text style={[styles.name, { color: colors.textPrimary }]}>
        {product.product_name || 'Unknown product'}
      </Text>
      {!!product.brands && (
        <Text style={[styles.brand, { color: colors.textSecondary }]}>{product.brands}</Text>
      )}
      {!!product.quantity && (
        <Text style={[styles.quantity, { color: colors.textSecondary }]}>{product.quantity}</Text>
      )}

      <Text style={[styles.label, { color: colors.textSecondary }]}>What's the price? (€)</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }]}
        keyboardType="decimal-pad"
        placeholder="e.g. 3.50"
        placeholderTextColor={colors.textSecondary}
        value={price}
        onChangeText={onPriceChange}
      />

      <View style={styles.buttonSpacing}>
        <Button
          variant="ghost"
          onPress={onScanTag}
          loading={aiLoading}
          style={{ borderWidth: 2, borderColor: colors.accentPurple }}
        >
          <Text style={[styles.outlineLabel, { color: colors.accentPurple }]}>
            {!aiLoading ? '📷  Scan Price Tag Instead' : 'AI reading price...'}
          </Text>
        </Button>
      </View>

      <StoreSelector
        stores={STORES}
        selectedStore={selectedStore}
        onSelect={onStoreSelect}
      />

      <Button
        variant="ghost"
        onPress={onSubmit}
        loading={saving}
        style={{ borderWidth: 2, borderColor: colors.buttonPrimary }}
      >
        <Text style={[styles.outlineLabel, { color: colors.buttonPrimary }]}>
          Submit Price 💾
        </Text>
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardSpacing: { width: '100%', marginBottom: Spacing.lg },
  image: { width: 120, height: 120, resizeMode: 'contain', marginBottom: Spacing.md, alignSelf: 'center' },
  name: { fontSize: Typography.heading1, fontWeight: '700', fontFamily: 'Inter', textAlign: 'center', marginBottom: Spacing.xs },
  brand: { fontSize: Typography.heading3, textAlign: 'center', marginBottom: 2 },
  quantity: { fontSize: Typography.body, textAlign: 'center', marginBottom: Spacing.md },
  label: { fontSize: Typography.body, fontWeight: '500', marginBottom: Spacing.sm, marginTop: Spacing.md },
  input: { borderWidth: 1, borderRadius: Radii.sm, padding: Spacing.md, fontSize: Typography.heading2, width: '100%', marginBottom: Spacing.sm, minHeight: TouchTargets.minHeight },
  buttonSpacing: { marginBottom: Spacing.xs },
  outlineLabel: { fontSize: Typography.body, fontWeight: '700', fontFamily: 'Inter' },
});
