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
import { TouchTargets } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Product } from '@/types/index';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const CLUB_CARD_NAMES = ['Tesco Clubcard', 'Real Rewards', 'Lidl Plus', 'Other'] as const;

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
  hasClubCard: boolean;
  onToggleClubCard: () => void;
  clubCardPrice: string;
  onClubCardPriceChange: (p: string) => void;
  clubCardName: string;
  onClubCardNameChange: (n: string) => void;
};

export default function ProductCard({
  product, price, onPriceChange, onScanTag,
  aiLoading, selectedStore, onStoreSelect, onSubmit, saving,
  hasClubCard, onToggleClubCard, clubCardPrice, onClubCardPriceChange,
  clubCardName, onClubCardNameChange,
}: Props) {
  const { colors, typography, spacing, radii, isDark } = useTheme();

  const styles = StyleSheet.create({
    cardSpacing:        { width: '100%', marginBottom: spacing.lg },
    image:              { width: 120, height: 120, resizeMode: 'contain', marginBottom: spacing.md, alignSelf: 'center' },
    name:               { fontSize: typography.heading1, fontWeight: '700', fontFamily: 'Inter', textAlign: 'center', marginBottom: spacing.xs },
    brand:              { fontSize: typography.heading3, textAlign: 'center', marginBottom: 2 },
    quantity:           { fontSize: typography.body, textAlign: 'center', marginBottom: spacing.md },
    label:              { fontSize: typography.body, fontWeight: '500', marginBottom: spacing.sm, marginTop: spacing.md },
    input:              { borderWidth: 1, borderRadius: radii.sm, padding: spacing.md, fontSize: typography.heading2, width: '100%', marginBottom: spacing.sm, minHeight: TouchTargets.minHeight },
    buttonSpacing:      { marginBottom: spacing.xs },
    outlineLabel:       { fontSize: typography.body, fontWeight: '700', fontFamily: 'Inter' },
    clubCardToggle:     { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.sm },
    checkbox:           { width: 20, height: 20, borderWidth: 2, borderRadius: radii.sm, marginRight: spacing.sm, alignItems: 'center', justifyContent: 'center' },
    checkmark:          { color: '#1A1C1E', fontSize: 12, fontWeight: '700' },
    clubCardToggleLabel: { fontSize: typography.body, fontFamily: 'Inter' },
    clubCardBox:        { borderWidth: 1.5, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm, backgroundColor: 'rgba(242, 183, 5, 0.10)' },
    clubCardTitle:      { fontSize: typography.body, fontWeight: '700', fontFamily: 'Inter', marginBottom: spacing.sm },
    pillRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
    pill:               { borderWidth: 1.5, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
    pillLabel:          { fontSize: typography.tiny, fontWeight: '600', fontFamily: 'Inter' },
  });

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
          style={{ borderWidth: 2, borderColor: colors.accentPurple, backgroundColor: isDark ? 'transparent' : colors.purpleTint }}
        >
          <Text style={[styles.outlineLabel, { color: colors.accentPurple }]}>
            {!aiLoading ? '📷  Scan Price Tag Instead' : 'AI reading price...'}
          </Text>
        </Button>
      </View>

      <Pressable
        onPress={onToggleClubCard}
        style={styles.clubCardToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: hasClubCard }}
      >
        <View style={[styles.checkbox, { borderColor: colors.accentGold }, hasClubCard && { backgroundColor: colors.accentGold }]}>
          {hasClubCard && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={[styles.clubCardToggleLabel, { color: colors.textPrimary }]}>
          This store has a club card price
        </Text>
      </Pressable>

      {hasClubCard && (
        <View style={[styles.clubCardBox, { borderColor: colors.accentGold }]}>
          <Text style={[styles.clubCardTitle, { color: colors.accentGold }]}>💳 Club Card Price</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }]}
            keyboardType="decimal-pad"
            placeholder="Club card price e.g. 2.99"
            placeholderTextColor={colors.textSecondary}
            value={clubCardPrice}
            onChangeText={onClubCardPriceChange}
          />
          <View style={styles.pillRow}>
            {CLUB_CARD_NAMES.map(name => (
              <Pressable
                key={name}
                onPress={() => onClubCardNameChange(name)}
                style={[
                  styles.pill,
                  { borderColor: colors.accentGold },
                  clubCardName === name && { backgroundColor: colors.accentGold },
                ]}
              >
                <Text style={[
                  styles.pillLabel,
                  { color: clubCardName === name ? '#1A1C1E' : colors.accentGold },
                ]}>
                  {name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <StoreSelector
        stores={STORES}
        selectedStore={selectedStore}
        onSelect={onStoreSelect}
      />

      <Button
        variant="ghost"
        onPress={onSubmit}
        loading={saving}
        style={{ borderWidth: 2, borderColor: colors.buttonPrimary, backgroundColor: isDark ? 'transparent' : colors.greenTint }}
      >
        <Text style={[styles.outlineLabel, { color: colors.buttonPrimary }]}>
          Submit Price 💾
        </Text>
      </Button>
    </Card>
  );
}
