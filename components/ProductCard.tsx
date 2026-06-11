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
import { TouchTargets } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useEffect } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const STORE_CLUB_CARD: Record<string, string> = {
  'Tesco': 'Tesco Clubcard',
  'Lidl': 'Lidl Plus',
  // 'Centra': 'My Centra Rewards', // future
};

const STORE_HAS_SHELF_PRICE: Record<string, boolean> = {
  'Tesco': true,
  'Lidl': true,
  // 'Centra': true, // future
};

type Props = {
  price: string;
  onPriceChange: (p: string) => void;
  selectedStore: string;
  onSubmit: () => void;
  saving: boolean;
  clubCardPrice: string;
  onClubCardPriceChange: (p: string) => void;
  clubCardName: string;
  onClubCardNameChange: (n: string) => void;
};

export default function ProductCard({
  price, onPriceChange,
  selectedStore, onSubmit, saving,
  clubCardPrice, onClubCardPriceChange,
  clubCardName, onClubCardNameChange,
}: Props) {
  const { colors, typography, spacing, radii, isDark } = useTheme();

  useEffect(() => {
    onClubCardNameChange(STORE_CLUB_CARD[selectedStore] ?? '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore]);

  const styles = StyleSheet.create({
    cardSpacing:   { width: '100%', marginBottom: spacing.lg },
    label:         { fontSize: typography.body, fontWeight: '500', marginBottom: spacing.sm },
    input:         { borderWidth: 1, borderRadius: radii.sm, padding: spacing.md, fontSize: typography.heading2, width: '100%', marginBottom: spacing.sm, minHeight: TouchTargets.minHeight },
    outlineLabel:  { fontSize: typography.body, fontWeight: '700', fontFamily: 'Inter' },
    clubCardBox:   { borderWidth: 1.5, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm, backgroundColor: 'rgba(242, 183, 5, 0.10)' },
    clubCardTitle: { fontSize: typography.body, fontWeight: '700', fontFamily: 'Inter', marginBottom: spacing.sm },
  });

  return (
    <Card style={styles.cardSpacing}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>What's the price? (€)</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }]}
        keyboardType="decimal-pad"
        placeholder="e.g. 3.50"
        placeholderTextColor={colors.textSecondary}
        value={price}
        onChangeText={(text) => onPriceChange(text.replace(',', '.'))}
      />

      {STORE_HAS_SHELF_PRICE[selectedStore] && (
        <View style={[styles.clubCardBox, { borderColor: colors.accentGold }]}>
          <Text style={[styles.clubCardTitle, { color: colors.accentGold }]}>
            💳 {clubCardName || 'Club Card'} price
          </Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }]}
            keyboardType="decimal-pad"
            placeholder="Club card price e.g. 2.99"
            placeholderTextColor={colors.textSecondary}
            value={clubCardPrice}
            onChangeText={(text) => onClubCardPriceChange(text.replace(',', '.'))}
          />
        </View>
      )}

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
