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
import { parseDeal, type MixedDealGroup } from '@/hooks/useBasket';
import { useTheme } from '@/hooks/useTheme';
import { Image, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  group: MixedDealGroup | null;
  visible: boolean;
  onClose: () => void;
}

export function MixedDealModal({ group, visible, onClose }: Props) {
  const { colors, isDark, typography, spacing, radii } = useTheme();

  if (!group) return null;

  const parsed = parseDeal(group.dealText);

  // Quantity deal: items sorted desc — last freeItems.length entries are free (cheapest)
  const freeStartIdx = group.items.length - group.freeItems.length;
  const paidDisplay = group.items.slice(0, freeStartIdx);
  const freeDisplay = group.items.slice(freeStartIdx);

  // Price deal: items sorted desc — last leftoverCount entries are leftover (cheapest)
  const dealGroupEndIdx = group.completeGroups * parsed.buyQty;
  const priceLeftoverItems = group.items.slice(dealGroupEndIdx);

  const styles = StyleSheet.create({
    overlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
    sheet:           { backgroundColor: colors.surface, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.xl, maxHeight: '85%' },
    header:          { marginBottom: spacing.lg },
    dealTitle:       { fontSize: typography.heading2, fontWeight: '700', fontFamily: 'Inter', color: colors.textPrimary, marginBottom: spacing.xs },
    dealSubtitle:    { fontSize: typography.bodySmall, fontFamily: 'Inter', color: colors.textSecondary },
    scrollContent:   { paddingBottom: spacing.md },
    groupHeader:     { fontSize: typography.bodySmall, fontWeight: '700', fontFamily: 'Inter', color: colors.accentGold, marginTop: spacing.sm, marginBottom: spacing.xs },
    itemRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.md },
    freeItemRow:     { backgroundColor: '#F2B70515', borderRadius: radii.sm, paddingHorizontal: spacing.xs },
    itemImage:       { width: 40, height: 40, borderRadius: radii.sm, resizeMode: 'contain' },
    itemPlaceholder: { width: 40, height: 40, borderRadius: radii.sm, backgroundColor: colors.greenLight, justifyContent: 'center', alignItems: 'center' },
    itemEmoji:       { fontSize: 20 },
    itemName:        { fontSize: typography.body, fontFamily: 'Inter', color: colors.textPrimary },
    itemNameFaded:   { fontSize: typography.body, fontFamily: 'Inter', color: colors.textSecondary, textDecorationLine: 'line-through' },
    itemPrice:       { fontSize: typography.body, fontWeight: '600', fontFamily: 'Inter', color: colors.primaryGreen },
    itemPriceFaded:  { fontSize: typography.body, fontWeight: '600', fontFamily: 'Inter', color: colors.textSecondary, textDecorationLine: 'line-through' },
    freeBadge:       { backgroundColor: colors.accentGold, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 2 },
    freeBadgeText:   { color: '#1A1C1E', fontSize: typography.caption, fontWeight: '700', fontFamily: 'Inter' },
    divider:         { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.sm, gap: spacing.sm },
    dividerLine:     { flex: 1, height: 1, backgroundColor: colors.border },
    dividerLabel:    { fontSize: typography.bodySmall, fontWeight: '700', fontFamily: 'Inter', color: colors.accentGold },
    leftoverNote:    { fontSize: typography.caption, fontFamily: 'Inter', color: colors.accentGold, marginTop: spacing.sm, textAlign: 'center' },
    summaryBox:      { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.md },
    summaryRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
    summaryLabel:    { fontSize: typography.body, fontFamily: 'Inter', color: colors.textSecondary },
    summaryValue:    { fontSize: typography.body, fontFamily: 'Inter' },
    gotItBtn:        { borderColor: isDark ? colors.buttonPrimary : colors.primaryGreen, borderWidth: 2, marginTop: spacing.md },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.dealTitle}>🏷️ {group.dealText} — {group.store}</Text>
            <Text style={styles.dealSubtitle}>
              {group.items.length} item{group.items.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {group.dealType === 'quantity' ? (
              <>
                {/* Paid items */}
                {paidDisplay.map((item, idx) => (
                  <View key={`paid-${item.barcode}-${idx}`} style={styles.itemRow}>
                    {item.image_url
                      ? <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                      : <View style={styles.itemPlaceholder}><Text style={styles.itemEmoji}>📦</Text></View>
                    }
                    <Text style={[styles.itemName, { flex: 1 }]} numberOfLines={2}>{item.product_name}</Text>
                    <Text style={styles.itemPrice}>€{item.price.toFixed(2)}</Text>
                  </View>
                ))}

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerLabel}>🎁 Free items</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Free items */}
                {freeDisplay.map((item, idx) => (
                  <View key={`free-${item.barcode}-${idx}`} style={[styles.itemRow, styles.freeItemRow]}>
                    {item.image_url
                      ? <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                      : <View style={styles.itemPlaceholder}><Text style={styles.itemEmoji}>📦</Text></View>
                    }
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemNameFaded} numberOfLines={2}>{item.product_name}</Text>
                      <View style={styles.freeBadge}>
                        <Text style={styles.freeBadgeText}>🎁 Free</Text>
                      </View>
                    </View>
                    <Text style={styles.itemPriceFaded}>€{item.price.toFixed(2)}</Text>
                  </View>
                ))}

                {group.leftoverCount > 0 && (
                  <Text style={styles.leftoverNote}>
                    ➕ {group.leftoverCount} item{group.leftoverCount !== 1 ? 's' : ''} not in a complete deal — add {parsed.buyQty - group.leftoverCount} more to save more!
                  </Text>
                )}
              </>
            ) : (
              <>
                {/* Complete deal groups */}
                {Array.from({ length: group.completeGroups }, (_, gi) => {
                  const groupItems = group.items.slice(gi * parsed.buyQty, (gi + 1) * parsed.buyQty);
                  return (
                    <View key={`group-${gi}`}>
                      <Text style={styles.groupHeader}>
                        Group {gi + 1}: {group.dealText} — €{parsed.dealPrice?.toFixed(2)} total
                      </Text>
                      {groupItems.map((item, idx) => (
                        <View key={`g${gi}-${item.barcode}-${idx}`} style={styles.itemRow}>
                          {item.image_url
                            ? <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                            : <View style={styles.itemPlaceholder}><Text style={styles.itemEmoji}>📦</Text></View>
                          }
                          <Text style={[styles.itemName, { flex: 1 }]} numberOfLines={2}>{item.product_name}</Text>
                          <Text style={styles.itemPrice}>€{item.price.toFixed(2)}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })}

                {/* Leftover items at full price */}
                {priceLeftoverItems.length > 0 && (
                  <>
                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerLabel}>At full price</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    {priceLeftoverItems.map((item, idx) => (
                      <View key={`leftover-${item.barcode}-${idx}`} style={styles.itemRow}>
                        {item.image_url
                          ? <Image source={{ uri: item.image_url }} style={styles.itemImage} />
                          : <View style={styles.itemPlaceholder}><Text style={styles.itemEmoji}>📦</Text></View>
                        }
                        <Text style={[styles.itemName, { flex: 1 }]} numberOfLines={2}>{item.product_name}</Text>
                        <Text style={styles.itemPrice}>€{item.price.toFixed(2)}</Text>
                      </View>
                    ))}

                    <Text style={styles.leftoverNote}>
                      Add {parsed.buyQty - group.leftoverCount} more for another {group.dealText} deal
                    </Text>
                  </>
                )}
              </>
            )}

          </ScrollView>

          {/* Summary */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Normal total</Text>
              <Text style={[styles.summaryValue, { textDecorationLine: 'line-through', color: colors.textSecondary }]}>
                €{group.normalTotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Deal total</Text>
              <Text style={[styles.summaryValue, { color: colors.primaryGreen }]}>
                €{group.dealTotal.toFixed(2)} ✅
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Saving</Text>
              <Text style={[styles.summaryValue, { color: colors.primaryGreen, fontWeight: '700' }]}>
                €{group.totalSaving.toFixed(2)} 🎉
              </Text>
            </View>
          </View>

          <Button variant="secondary" onPress={onClose} style={styles.gotItBtn}>
            Got it ✓
          </Button>

        </View>
      </View>
    </Modal>
  );
}
