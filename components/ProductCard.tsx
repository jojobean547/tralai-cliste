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
import { STORES } from '@/constants/stores';
import { Radii, Spacing, TouchTargets, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Product } from '@/types/index';
import {
  ActivityIndicator, Image, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';

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
  const s = styles(colors);

  return (
    <View style={s.card}>
      {!!product.image_url && (
        <Image source={{ uri: product.image_url }} style={s.image} />
      )}
      <Text style={s.name}>{product.product_name || 'Unknown product'}</Text>
      {!!product.brands && <Text style={s.brand}>{product.brands}</Text>}
      {!!product.quantity && <Text style={s.quantity}>{product.quantity}</Text>}

      <Text style={s.label}>What's the price? (€)</Text>
      <TextInput
        style={s.input}
        keyboardType="decimal-pad"
        placeholder="e.g. 3.50"
        placeholderTextColor={colors.textSecondary}
        value={price}
        onChangeText={onPriceChange}
      />

      <TouchableOpacity
        style={s.scanBtn}
        onPress={onScanTag}
        disabled={aiLoading}
        activeOpacity={0.85}
      >
        {aiLoading ? (
          <>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={s.scanBtnText}> AI reading price...</Text>
          </>
        ) : (
          <Text style={s.scanBtnText}>📷  Scan Price Tag Instead</Text>
        )}
      </TouchableOpacity>

      <StoreSelector
        stores={STORES}
        selectedStore={selectedStore}
        onSelect={onStoreSelect}
      />

      <TouchableOpacity
        style={s.submitBtn}
        onPress={onSubmit}
        disabled={saving}
        activeOpacity={0.85}
      >
        {saving
          ? <ActivityIndicator color={colors.primaryGreen} />
          : <Text style={s.submitBtnText}>Submit Price 💾</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = (c: ReturnType<typeof import('@/hooks/useTheme').useTheme>['colors']) =>
  StyleSheet.create({
    card: { backgroundColor: c.surface, padding: Spacing.xl, borderRadius: Radii.lg, width: '100%', marginBottom: Spacing.xl, borderWidth: 0.5, borderColor: c.border },
    image: { width: 120, height: 120, resizeMode: 'contain', marginBottom: Spacing.md, alignSelf: 'center' },
    name: { fontSize: Typography.heading3, fontWeight: '600', color: c.textPrimary, textAlign: 'center', marginBottom: Spacing.xs },
    brand: { fontSize: Typography.bodySmall, color: c.textSecondary, textAlign: 'center', marginBottom: 2 },
    quantity: { fontSize: Typography.caption, color: c.textSecondary, textAlign: 'center', marginBottom: Spacing.md },
    label: { fontSize: Typography.body, fontWeight: '500', color: c.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md },
    input: { borderWidth: 0.5, borderColor: c.border, borderRadius: Radii.sm, padding: Spacing.md, fontSize: Typography.heading3, width: '100%', marginBottom: Spacing.sm, backgroundColor: c.background, color: c.textPrimary, minHeight: TouchTargets.minHeight },
    scanBtn: { backgroundColor: c.accentPurple, padding: Spacing.md, borderRadius: Radii.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.sm, minHeight: TouchTargets.minHeight },
    scanBtnText: { color: '#FFFFFF', fontSize: Typography.body, fontWeight: '600' },
    submitBtn: { backgroundColor: c.greenLight, padding: Spacing.md, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm, minHeight: TouchTargets.minHeight, width:'100%' },
    submitBtnText: { color: c.primaryGreen, fontSize: Typography.body, fontWeight: '600' },
  });
