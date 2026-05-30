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
import { useAlert } from '@/hooks/useAlert';
import { useBasket } from '@/hooks/useBasket';
import { useTheme } from '@/hooks/useTheme';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useRouter } from 'expo-router';
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
  const { colors, isDark, typography, spacing, radii } = useTheme();
  const { showAlert, alertProps } = useAlert();
  const { hasClubCard } = useUserPreferences();
  const router = useRouter();

  const styles = StyleSheet.create({
    safe:                 { flex: 1 },
    outer:                { flex: 1 },
    emptyEmoji:           { fontSize: 64 },
    emptyIconImage:       { width: spacing.xxl * 3, height: spacing.xxl * 3, borderRadius: radii.lg},
    iconImage:            { width: spacing.xxl * 2, height: spacing.xxl * 2, borderRadius: radii.md},
    header:               { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.xl, paddingBottom: spacing.md },
    headerIcon:           { fontSize: typography.heading2 },
    headerTitle:          { fontSize: typography.heading1, fontWeight: '700', fontFamily: 'Inter' },
    list:                 { flex: 1 },
    listContent:          { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
    itemCard:             { marginBottom: spacing.sm, padding: spacing.md },
    itemRow:              { flexDirection: 'row', alignItems: 'center' },
    itemImage:            { width: 56, height: 56, resizeMode: 'contain', borderRadius: radii.sm, marginRight: spacing.md },
    itemImagePlaceholder: { width: 56, height: 56, borderRadius: radii.sm, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    itemImageEmoji:       { fontSize: 24 },
    itemInfo:             { flex: 1 },
    itemName:             { fontSize: typography.heading2, fontWeight: '500', fontFamily: 'Inter', marginBottom: 2 },
    itemStore:            { fontSize: typography.body, marginBottom: 2 },
    itemPrice:            { fontSize: typography.heading2, fontWeight: '600', fontFamily: 'Inter' },
    itemRight:            { alignItems: 'flex-end', marginLeft: spacing.sm, gap: spacing.sm },
    qtyRow:               { flexDirection: 'row', alignItems: 'center' },
    qtyBtn:               { width: 32, height: 32, borderRadius: radii.full, justifyContent: 'center', alignItems: 'center' },
    qtyBtnText:           { fontSize: typography.heading2, fontWeight: '600' },
    qtyText:              { fontSize: typography.heading3, fontWeight: '600', fontFamily: 'Inter', marginHorizontal: spacing.sm, minWidth: 20, textAlign: 'center' },
    dealBadge:            { backgroundColor: colors.accentGold, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 2 },
    dealBadgeText:        { color: '#1A1C1E', fontSize: typography.caption, fontWeight: '700', fontFamily: 'Inter' },
    dealPriceRow:         { flexDirection: 'row', alignItems: 'center' },
    regularPrice:         { fontSize: typography.bodySmall, fontFamily: 'Inter', textDecorationLine: 'line-through' },
    dealArrow:            { fontSize: typography.bodySmall, fontFamily: 'Inter', marginHorizontal: spacing.xs },
    dealFinalPrice:       { fontSize: typography.heading3, fontWeight: '700', fontFamily: 'Inter' },
    dealPriceLabel:       { fontSize: typography.tiny, fontFamily: 'Inter' },
    clubCardRow:          { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    clubCardText:         { fontSize: typography.bodySmall, fontWeight: '700', fontFamily: 'Inter' },
    clubCardName:         { fontSize: typography.bodySmall, fontFamily: 'Inter' },
    dealHint:             { fontSize: typography.tiny, fontFamily: 'Inter', marginTop: 2 },
    footer:               { borderTopWidth: 0.5, padding: spacing.xl },
    totalRow:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    totalLabel:           { fontSize: typography.heading3 },
    totalAmount:          { fontSize: 36, fontWeight: '700', fontFamily: 'Inter' },
  });

  if (basket.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <EmptyState
          icon={
            <Image
              source={
                isDark
                  ? require('@/assets/images/app_icon_dark.png')
                  : require('@/assets/images/app_icon_dark.png')}
              style={styles.emptyIconImage}
              resizeMode="contain"
          />
          }
          title="Your basket is empty"
          subtitle='Scan a product and tap "Add" to add items'
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.outer}>

        {/* Fixed header */}
        <View style={styles.header}>
          <Image
              source={require('@/assets/images/app_icon_dark.png')}
              style={styles.iconImage}
              resizeMode="contain"
          />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Basket</Text>
        </View>

        {/* Scrollable item list */}
        <FlatList
          data={basket}
          keyExtractor={item => `${item.barcode}-${item.store_name}`}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
                  {!!item.deal && (
                    <View style={styles.dealBadge}>
                      <Text style={styles.dealBadgeText}>🏷️ {item.deal}</Text>
                    </View>
                  )}
                  {(() => {
                    const dealLower = item.deal?.toLowerCase() ?? '';
                    const isThreeForTwo = dealLower.includes('for 2') || dealLower.includes('get 1 free');

                    if (isThreeForTwo && item.deal_price != null) {
                      if (item.quantity >= 3) {
                        const freeItems = Math.floor(item.quantity / 3);
                        const paidItems = item.quantity - freeItems;
                        return (
                          <>
                            <View style={styles.dealPriceRow}>
                              <Text style={[styles.regularPrice, { color: colors.textSecondary }]}>
                                €{(item.price * item.quantity).toFixed(2)}
                              </Text>
                              <Text style={[styles.dealArrow, { color: colors.textSecondary }]}>→</Text>
                              <Text style={[styles.dealFinalPrice, { color: colors.primaryGreen }]}>
                                €{(item.price * paidItems).toFixed(2)}
                              </Text>
                            </View>
                            <View style={styles.dealBadge}>
                              <Text style={styles.dealBadgeText}>
                                🎁 {freeItems} item{freeItems > 1 ? 's' : ''} free
                              </Text>
                            </View>
                          </>
                        );
                      }
                      return (
                        <>
                          <Text style={[styles.itemPrice, { color: colors.primaryGreen }]}>
                            €{(item.price * item.quantity).toFixed(2)}
                          </Text>
                          <Text style={[styles.dealHint, { color: colors.accentGold }]}>
                            Add {3 - item.quantity} more for deal
                          </Text>
                        </>
                      );
                    }

                    if (item.deal && item.dealTotal != null && item.quantity >= 3) {
                      return (
                        <>
                          <View style={styles.dealPriceRow}>
                            <Text style={[styles.regularPrice, { color: colors.textSecondary }]}>
                              €{(item.price * item.quantity).toFixed(2)}
                            </Text>
                            <Text style={[styles.dealArrow, { color: colors.textSecondary }]}>→</Text>
                            <Text style={[styles.dealFinalPrice, { color: colors.primaryGreen }]}>
                              €{item.dealTotal.toFixed(2)}
                            </Text>
                          </View>
                          <Text style={[styles.dealPriceLabel, { color: colors.textSecondary }]}>
                            Deal price
                          </Text>
                          {item.club_card_price != null && (
                            <View style={styles.clubCardRow}>
                              <Text style={[styles.clubCardText, { color: colors.accentGold }]}>
                                💳 €{item.club_card_price.toFixed(2)}
                              </Text>
                              {!!item.club_card_name && (
                                <Text style={[styles.clubCardName, { color: colors.textSecondary }]}>
                                  {' '}{item.club_card_name}
                                </Text>
                              )}
                            </View>
                          )}
                        </>
                      );
                    }

                    if (item.club_card_price != null) {
                      const userHasCard = !!item.club_card_name && hasClubCard(item.club_card_name);
                      if (userHasCard) {
                        return (
                          <>
                            <View style={styles.dealPriceRow}>
                              <Text style={[styles.regularPrice, { color: colors.textSecondary }]}>
                                €{(item.price * item.quantity).toFixed(2)}
                              </Text>
                              <Text style={[styles.dealArrow, { color: colors.textSecondary }]}>→</Text>
                              <Text style={[styles.dealFinalPrice, { color: colors.accentGold }]}>
                                💳 €{(item.club_card_price * item.quantity).toFixed(2)}
                              </Text>
                            </View>
                            {!!item.club_card_name && (
                              <Text style={[styles.dealPriceLabel, { color: colors.textSecondary }]}>
                                {item.club_card_name}
                              </Text>
                            )}
                          </>
                        );
                      }
                      return (
                        <>
                          <Text style={[styles.itemPrice, { color: colors.primaryGreen }]}>
                            €{(item.price * item.quantity).toFixed(2)}
                          </Text>
                          <Text style={[styles.dealHint, { color: colors.accentGold }]}>
                            💳 €{item.club_card_price.toFixed(2)} available with {item.club_card_name}
                          </Text>
                          <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
                            <Text style={[styles.dealHint, { color: colors.accentGold }]}>
                              Add card in Settings →
                            </Text>
                          </TouchableOpacity>
                        </>
                      );
                    }

                    return (
                      <Text style={[styles.itemPrice, { color: colors.primaryGreen }]}>
                        €{(item.price * item.quantity).toFixed(2)}
                      </Text>
                    );
                  })()}
                </View>
                <View style={styles.itemRight}>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: colors.greenTintBg, borderWidth: 1.5, borderColor: colors.greenTintText }]}
                      onPress={() => updateQuantity(item.barcode, item.store_name, item.quantity - 1)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.qtyBtnText, { color: colors.greenTintText }]}>−</Text>
                    </TouchableOpacity>
                    <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: colors.greenTintBg, borderWidth: 1.5, borderColor: colors.greenTintText }]}
                      onPress={() => updateQuantity(item.barcode, item.store_name, item.quantity + 1)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.qtyBtnText, { color: colors.greenTintText }]}>+</Text>
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

        {/* Fixed footer */}
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
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
        </View>

      </View>
      <AppAlert {...alertProps} />
    </SafeAreaView>
  );
}
