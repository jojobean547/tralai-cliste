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

import OfflineBanner from '@/components/OfflineBanner';
import PriceList from '@/components/PriceList';
import ProductCard from '@/components/ProductCard';
import ProductSummary from '@/components/ProductSummary';
import { AppAlert } from '@/components/ui/AppAlert';
import { Button } from '@/components/ui/Button';
import { useNetwork } from '@/hooks/useNetwork';
import { usePrices } from '@/hooks/usePrices';
import { useTheme } from '@/hooks/useTheme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { isOnline } = useNetwork();
  const { colors, typography, spacing, radii, isDark } = useTheme();
  const {
    priceEntries, product, price, selectedStore, setSelectedStore,
    submitted, saving, aiLoading, error, loading,
    hasClubCard, setHasClubCard, clubCardPrice, setClubCardPrice,
    clubCardName, setClubCardName,
    lookUpProduct, handleSubmitPrice, handleConfirmPrice, handleFlagPrice,
    handleScanPriceTag, handleAddToBasket, handlePriceChange, resetScan,
    alertProps,
  } = usePrices();

  const styles = StyleSheet.create({
    safe:           { flex: 1 },
    centred:        { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.lg },
    header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
    headerLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
    logoImage:      { width: 92, height: 92, borderRadius: 2 },
    title:          { fontSize: typography.heading1, fontWeight: '700', fontFamily: 'Inter' },
    onlinePill:     { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.pill, borderWidth: 1 },
    onlinePillText: { fontSize: typography.bodySmall, fontWeight: '600' },
    scrollWrapper:  { flex: 1 },
    scrollContent:  { flexGrow: 1, padding: spacing.xl },
    scanArea:       { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: radii.lg, padding: spacing.xxl, alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg, minHeight: 160, justifyContent: 'center' },
    scanIcon:       { fontSize: 40 },
    scanText:       { fontSize: typography.body, textAlign: 'center' },
    loadingRow:     { alignItems: 'center', gap: spacing.md, marginVertical: spacing.xl },
    message:        { fontSize: typography.body, textAlign: 'center' },
    errorBox:       { padding: spacing.md, borderRadius: radii.sm, marginBottom: spacing.md, borderWidth: 1 },
    error:          { fontSize: typography.bodySmall, textAlign: 'center' },
    noPricesBox:    { padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.md, borderWidth: 1 },
    noPricesText:   { fontSize: typography.bodySmall, textAlign: 'center' },
    successBox:     { padding: spacing.lg, borderRadius: radii.md, marginBottom: spacing.xl, borderWidth: 1 },
    successText:    { fontSize: typography.body, textAlign: 'center' },
    scanBtnSpacing: { marginTop: spacing.sm },
    scanBtnLabel:   { fontSize: typography.body, fontWeight: '700', fontFamily: 'Inter' },
  });

  if (!permission) return <View style={[styles.safe, { backgroundColor: colors.background }]} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.centred}>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            We need camera permission to scan barcodes
          </Text>
          <Button variant="primary" onPress={requestPermission}>
            Grant Permission
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {scanning && (
        <CameraView
          style={StyleSheet.absoluteFill}
          onBarcodeScanned={({ data }) => { setScanning(false); lookUpProduct(data); }}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
        />
      )}

      {!scanning && (
        <>
          {/* Fixed header */}
          <View style={[styles.header, { backgroundColor: colors.background }]}>
            <View style={styles.headerLeft}>
              <Image
                source={
                  isDark
                    ? require('@/assets/images/app_icon_dark.png')
                    : require('@/assets/images/app_icon_dark.png')}
                style={styles.logoImage}
              />
              <Text style={[styles.title, { color: colors.textPrimary }]}>Tralaí Cliste</Text>
            </View>
            <View style={[
              styles.onlinePill,
              { backgroundColor: isOnline ? colors.greenTintBg : colors.errorBg,
                borderColor: isOnline ? colors.greenTintText : colors.error },
            ]}>
              <Text style={[styles.onlinePillText, { color: isOnline ? colors.greenTintText : colors.error }]}>
                {isOnline ? '● Online' : '● Offline'}
              </Text>
            </View>
          </View>

          {/* Scrollable middle section */}
          <KeyboardAvoidingView style={styles.scrollWrapper} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}>

              <OfflineBanner isOnline={isOnline} />

              {!product && !loading && (
                <View style={[styles.scanArea, { backgroundColor: colors.surfaceAlt, borderColor: colors.primaryGreen }]}>
                  <Text style={styles.scanIcon}>⬚</Text>
                  <Text style={[styles.scanText, { color: colors.textSecondary }]}>
                    Point camera at barcode or price tag
                  </Text>
                </View>
              )}

              {loading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="large" color={colors.primaryGreen} />
                  <Text style={[styles.message, { color: colors.textSecondary }]}>Looking up product...</Text>
                </View>
              )}

              {!!error && (
                <View style={[styles.errorBox, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
                  <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
                </View>
              )}

              {!!product && !submitted && (
                <ProductCard
                  product={product}
                  price={price}
                  onPriceChange={handlePriceChange}
                  onScanTag={handleScanPriceTag}
                  aiLoading={aiLoading}
                  selectedStore={selectedStore}
                  onStoreSelect={setSelectedStore}
                  onSubmit={handleSubmitPrice}
                  saving={saving}
                  hasClubCard={hasClubCard}
                  onToggleClubCard={() => setHasClubCard(v => !v)}
                  clubCardPrice={clubCardPrice}
                  onClubCardPriceChange={setClubCardPrice}
                  clubCardName={clubCardName}
                  onClubCardNameChange={setClubCardName}
                />
              )}

              {submitted && (
                <View style={[styles.successBox, { backgroundColor: colors.infoBg, borderColor: colors.success }]}>
                  <Text style={[styles.successText, { color: colors.success }]}>
                    ✅ Price saved! Thank you for helping the community!
                  </Text>
                </View>
              )}

              {submitted && !!product && (
                <ProductSummary product={product} />
              )}

              <PriceList
                entries={priceEntries}
                onConfirm={handleConfirmPrice}
                onFlag={handleFlagPrice}
                onAddToBasket={handleAddToBasket}
              />

              {priceEntries.length === 0 && !!product && !loading && (
                <View style={[styles.noPricesBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.borderStrong }]}>
                  <Text style={[styles.noPricesText, { color: colors.primaryGreen }]}>
                    📭 No prices yet for this product — be the first!
                  </Text>
                </View>
              )}

              <Button
                variant="ghost"
                onPress={() => { resetScan(); setScanning(true); }}
                style={[styles.scanBtnSpacing, { borderWidth: 2, borderColor: colors.buttonSecondary, backgroundColor: isDark ? 'transparent' : colors.greenTint }]}
              >
                <Text style={[styles.scanBtnLabel, { color: colors.buttonSecondary }]}>
                  {product ? 'Scan Another Product' : 'Scan a Product'}
                </Text>
              </Button>

            </ScrollView>
          </KeyboardAvoidingView>
        </>
      )}

      <AppAlert {...alertProps} />
    </SafeAreaView>
  );
}
