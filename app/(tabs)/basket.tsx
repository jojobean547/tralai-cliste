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

import { AppAlert } from '@/components/ui/AppAlert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Radii, Spacing, Typography } from '@/constants/theme';
import { useAlert } from '@/hooks/useAlert';
import { useBasket } from '@/hooks/useBasket';
import { useTheme } from '@/hooks/useTheme';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BasketScreen() {
  const { basket, removeItem, updateQuantity, clearBasket, total, itemCount } = useBasket();
  const { colors } = useTheme();
  const { showAlert, alertProps } = useAlert();

  if (basket.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <EmptyState
          icon={<Text style={styles.emptyEmoji}>🛒</Text>}
          title="Your basket is empty"
          subtitle='Scan a product and tap "Add" to add items'
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🛒</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Basket</Text>
        </View>

        <FlatList
          data={basket}
          keyExtractor={item => `${item.barcode}-${item.store_name}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.itemCard}>
              <View style={styles.itemRow}>
                {item.image_url
                  ? <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                  : <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.greenLight }]}>
                      <Text style={styles.itemImageEmoji}>📦</Text>
                    </View>
                }
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={2}>
                    {item.product_name}
                  </Text>
                  <Text style={[styles.itemStore, { color: colors.textSecondary }]}>
                    {item.store_name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.primaryGreen }]}>
                    €{(item.dealTotal ?? item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.itemRight}>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: colors.primaryGreen }]}
                      onPress={() => updateQuantity(item.barcode, item.store_name, item.quantity - 1)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.qtyBtnText, { color: '#FFFFFF' }]}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: colors.primaryGreen }]}
                      onPress={() => updateQuantity(item.barcode, item.store_name, item.quantity + 1)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.qtyBtnText, { color: '#FFFFFF' }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Button
                    variant="danger"
                    size="sm"
                    fullWidth={false}
                    onPress={() => removeItem(item.barcode, item.store_name)}
                  >
                    Remove
                  </Button>
                </View>
              </View>
            </Card>
          )}
        />

        <Card style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </Text>
            <Text style={[styles.totalAmount, { color: colors.primaryGreen }]}>
              €{total.toFixed(2)}
            </Text>
          </View>
          <Button
            variant="danger"
            onPress={() => showAlert({
              title: 'Clear basket?',
              message: 'This will remove all items.',
              buttons: [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearBasket },
              ],
            })}
          >
            Clear Basket 🗑️
          </Button>
        </Card>
      </View>
      <AppAlert {...alertProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  emptyEmoji: { fontSize: 64 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.xl, paddingBottom: Spacing.md },
  headerIcon: { fontSize: Typography.heading2 },
  headerTitle: { fontSize: Typography.heading1, fontWeight: '700', fontFamily: 'Inter' },
  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  itemCard: { marginBottom: Spacing.sm, padding: Spacing.md },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemImage: { width: 56, height: 56, resizeMode: 'contain', borderRadius: Radii.sm, marginRight: Spacing.md },
  itemImagePlaceholder: { width: 56, height: 56, borderRadius: Radii.sm, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  itemImageEmoji: { fontSize: 24 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: Typography.heading2, fontWeight: '500', fontFamily: 'Inter', marginBottom: 2 },
  itemStore: { fontSize: Typography.body, marginBottom: 2 },
  itemPrice: { fontSize: Typography.heading2, fontWeight: '600', fontFamily: 'Inter' },
  itemRight: { alignItems: 'flex-end', marginLeft: Spacing.sm, gap: Spacing.sm },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 32, height: 32, borderRadius: Radii.full, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: Typography.heading2, fontWeight: '600' },
  qtyText: { fontSize: Typography.heading3, fontWeight: '600', fontFamily: 'Inter', marginHorizontal: Spacing.sm, minWidth: 20, textAlign: 'center' },
  totalCard: { margin: Spacing.lg },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  totalLabel: { fontSize: Typography.heading3 },
  totalAmount: { fontSize: 36, fontWeight: '700', fontFamily: 'Inter' },
});
