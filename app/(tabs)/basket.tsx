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

import { Radii, Spacing, TouchTargets, Typography } from '@/constants/theme';
import { useBasket } from '@/hooks/useBasket';
import { useTheme } from '@/hooks/useTheme';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BasketScreen() {
  const { basket, removeItem, updateQuantity, clearBasket, total, itemCount } = useBasket();
  const { colors } = useTheme();
  const s = styles(colors);

  if (basket.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.emptyContainer}>
          <Text style={s.emptyEmoji}>🛒</Text>
          <Text style={s.emptyTitle}>Your basket is empty</Text>
          <Text style={s.emptySubtitle}>
            Scan a product and tap "+ Basket" to add items
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.headerIcon}>🛒</Text>
          <Text style={s.headerTitle}>My Basket</Text>
        </View>

        <FlatList
          data={basket}
          keyExtractor={item => `${item.barcode}-${item.store_name}`}
          contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl }}
          renderItem={({ item }) => (
            <View style={s.itemCard}>
              {item.image_url
                ? <Image source={{ uri: item.image_url }} style={s.itemImage} />
                : <View style={s.itemImagePlaceholder}>
                    <Text style={{ fontSize: 24 }}>📦</Text>
                  </View>
              }
              <View style={s.itemInfo}>
                <Text style={s.itemName} numberOfLines={2}>{item.product_name}</Text>
                <Text style={s.itemStore}>{item.store_name}</Text>
                <Text style={s.itemPrice}>
                  €{(item.dealTotal ?? item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
              <View style={s.itemRight}>
                <View style={s.qtyRow}>
                  <TouchableOpacity
                    style={s.qtyBtn}
                    onPress={() => updateQuantity(item.barcode, item.store_name, item.quantity - 1)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={s.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={s.qtyBtn}
                    onPress={() => updateQuantity(item.barcode, item.store_name, item.quantity + 1)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={s.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={s.removeBtn}
                  onPress={() => removeItem(item.barcode, item.store_name)}
                >
                  <Text style={s.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <View style={s.totalCard}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
            <Text style={s.totalAmount}>€{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={s.clearBtn}
            onPress={() => Alert.alert(
              'Clear basket?',
              'This will remove all items.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearBasket }
              ]
            )}
          >
            <Text style={s.clearBtnText}>Clear Basket 🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = (c: ReturnType<typeof import('@/hooks/useTheme').useTheme>['colors']) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background, paddingTop: 0 },
    container: { flex: 1, backgroundColor: c.background },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl },
    emptyEmoji: { fontSize: 64, marginBottom: Spacing.lg },
    emptyTitle: { fontSize: Typography.heading2, fontWeight: '600', color: c.textPrimary, marginBottom: Spacing.sm },
    emptySubtitle: { fontSize: Typography.body, color: c.textSecondary, textAlign: 'center', lineHeight: 24 },
    header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.xl, paddingBottom: Spacing.md },
    headerIcon: { fontSize: Typography.heading2 },
    headerTitle: { fontSize: Typography.heading2, fontWeight: '600', color: c.textPrimary },
    itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, marginBottom: Spacing.sm, padding: Spacing.md, borderRadius: Radii.lg, borderWidth: 0.5, borderColor: c.border },
    itemImage: { width: 56, height: 56, resizeMode: 'contain', borderRadius: Radii.sm, marginRight: Spacing.md },
    itemImagePlaceholder: { width: 56, height: 56, backgroundColor: c.greenLight, borderRadius: Radii.sm, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
    itemInfo: { flex: 1 },
    itemName: { fontSize: Typography.heading3, fontWeight: '500', color: c.textPrimary, marginBottom: 2 },
    itemStore: { fontSize: Typography.body, color: c.textSecondary, marginBottom: 2 },
    itemPrice: { fontSize: Typography.heading3, fontWeight: '600', color: c.primaryGreen },
    itemRight: { alignItems: 'flex-end', marginLeft: Spacing.sm },
    qtyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
    qtyBtn: { width: 32, height: 32, backgroundColor: c.greenLight, borderRadius: Radii.full, justifyContent: 'center', alignItems: 'center' },
    qtyBtnText: { fontSize: Typography.heading3, color: c.primaryGreen, fontWeight: '600' },
    qtyText: { fontSize: Typography.body, fontWeight: '600', color: c.textPrimary, marginHorizontal: Spacing.sm, minWidth: 20, textAlign: 'center' },
    removeBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 4, backgroundColor: c.errorBg, borderRadius: Radii.sm },
    removeBtnText: { fontSize: Typography.caption, color: c.error, fontWeight: '600' },
    totalCard: { backgroundColor: c.surface, margin: Spacing.xl, padding: Spacing.xl, borderRadius: Radii.lg, borderWidth: 0.5, borderColor: c.border },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
    totalLabel: { fontSize: Typography.heading3, color: c.textSecondary },
    totalAmount: { fontSize: 36, fontWeight: '700', color: c.primaryGreen },
    clearBtn: { backgroundColor: c.errorBg, padding: Spacing.md, borderRadius: Radii.md, alignItems: 'center', borderWidth: 0.5, borderColor: c.errorBorder, minHeight: TouchTargets.minHeight, justifyContent: 'center' },
    clearBtnText: { color: c.error, fontWeight: '600', fontSize: Typography.heading3 },
  });