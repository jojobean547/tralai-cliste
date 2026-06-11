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
import StoreSelector from '@/components/StoreSelector';
import { AppAlert } from '@/components/ui/AppAlert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StoreBadge } from '@/components/ui/StoreBadge';
import { STORES } from '@/constants/stores';
import { Radii, Spacing, Typography } from '@/constants/theme';
import { useNetwork } from '@/hooks/useNetwork';
import { usePrices } from '@/hooks/usePrices';
import { useScanScreen } from '@/hooks/useScanScreen';
import { useTheme } from '@/hooks/useTheme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  ActivityIndicator, Image, KeyboardAvoidingView,
  Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { isOnline } = useNetwork();
  const { colors, isDark, spacing } = useTheme();
  const prices = usePrices();
  const {
    scanning,
    storeValidationError, scanError,
    handleStoreSelect, handleClearStore,
    handleScanAttempt, handleSubmitWithStoreCheck,
    cancelScanning,
  } = useScanScreen({
    selectedStore: prices.selectedStore,
    setSelectedStore: prices.setSelectedStore,
    resetScan: prices.resetScan,
    handleSubmitPrice: prices.handleSubmitPrice,
  });
  const {
    priceEntries, product, price, selectedStore,
    submitted, saving, error, loading,
    clubCardPrice, setClubCardPrice,
    clubCardName, setClubCardName,
    lookUpProduct, handleConfirmPrice, handleFlagPrice,
    handleAddToBasket, handlePriceChange,
    alertProps,
  } = prices;

  if (!permission) return <View style={[styles.safe, { backgroundColor: colors.background }]} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.centred}>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            We need camera permission to scan barcodes
          </Text>
          <Button variant="primary" onPress={requestPermission}>
            Grant Camera Permission
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {scanning && (
        <>
          <CameraView
            style={StyleSheet.absoluteFill}
            onBarcodeScanned={({ data }) => { cancelScanning(); void lookUpProduct(data); }}
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
          />
          <View style={styles.cameraControlsRow}>
            {!!selectedStore && <StoreBadge store={selectedStore} />}
            <Button variant="secondary" onPress={cancelScanning}>Cancel</Button>
          </View>
        </>
      )}

      {!scanning && (
        <>
          {/* Fixed header */}
          <View style={[styles.header, { backgroundColor: colors.background }]}>
            <View style={styles.headerLeft}>
              <Image
                source={require('@/assets/images/app_icon_dark.png')}
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
                <Card style={{ marginBottom: spacing.md }}>
                  <Text style={[styles.scanningLabel, { color: colors.textSecondary }]}>Scanning in store</Text>
                  <StoreSelector
                    stores={STORES}
                    selectedStore={selectedStore}
                    onSelect={handleStoreSelect}
                  />
                </Card>
              )}

              {!!scanError && !product && !loading && (
                <View style={[styles.errorBox, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
                  <Text style={[styles.error, { color: colors.error }]}>{scanError}</Text>
                </View>
              )}

              {!!selectedStore && !loading && (
                <View style={styles.storeIndicatorRow}>
                  <StoreBadge store={selectedStore} />
                  <Pressable onPress={handleClearStore} hitSlop={8}>
                    <Text style={[styles.changeStoreText, { color: colors.textSecondary }]}>Change</Text>
                  </Pressable>
                </View>
              )}

              {!product && !loading && (
                <Pressable onPress={handleScanAttempt} style={[styles.scanArea, { backgroundColor: colors.surfaceAlt, borderColor: colors.primaryGreen }]}>
                  <Text style={styles.scanIcon}>⬚</Text>
                  <Text style={[styles.scanText, { color: colors.textSecondary }]}>
                    Point camera at barcode or price tag
                  </Text>
                </Pressable>
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

              {!!product && (
                <>
                  {!!storeValidationError && (
                    <Text style={[styles.storeError, { color: colors.error }]}>{storeValidationError}</Text>
                  )}

                  <ProductSummary product={product} />

                  <PriceList
                    entries={priceEntries}
                    onConfirm={handleConfirmPrice}
                    onFlag={handleFlagPrice}
                    onAddToBasket={handleAddToBasket}
                  />

                  {priceEntries.length === 0 && !loading && (
                    <View style={[styles.noPricesBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.borderStrong }]}>
                      <Text style={[styles.noPricesText, { color: colors.primaryGreen }]}>
                        📭 No prices yet for this product — be the first!
                      </Text>
                    </View>
                  )}

                  <Button
                    variant="ghost"
                    onPress={handleScanAttempt}
                    style={{ marginTop: spacing.sm, borderWidth: 2, borderColor: colors.buttonSecondary, backgroundColor: isDark ? 'transparent' : colors.greenTint }}
                  >
                    <Text style={[styles.scanBtnLabel, { color: colors.buttonSecondary }]}>
                      Scan Another Product
                    </Text>
                  </Button>

                  <Text style={[styles.separator, { color: colors.textSecondary }]}>
                    See a different price?
                  </Text>

                  {submitted && (
                    <View style={[styles.successBox, { backgroundColor: colors.infoBg, borderColor: colors.success }]}>
                      <Text style={[styles.successText, { color: colors.success }]}>
                        ✅ Price saved! Thank you for helping the community!
                      </Text>
                    </View>
                  )}

                  {!submitted && (
                    <ProductCard
                      price={price}
                      onPriceChange={handlePriceChange}
                      selectedStore={selectedStore}
                      onSubmit={handleSubmitWithStoreCheck}
                      saving={saving}
                      clubCardPrice={clubCardPrice}
                      onClubCardPriceChange={setClubCardPrice}
                      clubCardName={clubCardName}
                      onClubCardNameChange={setClubCardName}
                    />
                  )}
                </>
              )}

              {!product && (
                <Button
                  variant="ghost"
                  onPress={handleScanAttempt}
                  style={{ marginTop: spacing.sm, borderWidth: 2, borderColor: colors.buttonSecondary, backgroundColor: isDark ? 'transparent' : colors.greenTint }}
                >
                  <Text style={[styles.scanBtnLabel, { color: colors.buttonSecondary }]}>
                    Scan a Product
                  </Text>
                </Button>
              )}

            </ScrollView>
          </KeyboardAvoidingView>
        </>
      )}

      <AppAlert {...alertProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1 },
  centred:           { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: Spacing.lg },
  header:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  headerLeft:        { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoImage:         { width: 92, height: 92, borderRadius: 2 },
  title:             { fontSize: Typography.heading1, fontWeight: '700', fontFamily: 'Inter' },
  onlinePill:        { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radii.pill, borderWidth: 1 },
  onlinePillText:    { fontSize: Typography.bodySmall, fontWeight: '600' },
  scrollWrapper:     { flex: 1 },
  scrollContent:     { flexGrow: 1, padding: Spacing.xl },
  scanArea:          { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: Radii.lg, padding: Spacing.xxl, alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg, minHeight: 160, justifyContent: 'center' },
  scanIcon:          { fontSize: 40 },
  scanText:          { fontSize: Typography.body, textAlign: 'center' },
  loadingRow:        { alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.xl },
  message:           { fontSize: Typography.body, textAlign: 'center' },
  errorBox:          { padding: Spacing.md, borderRadius: Radii.sm, marginBottom: Spacing.md, borderWidth: 1 },
  error:             { fontSize: Typography.bodySmall, textAlign: 'center' },
  noPricesBox:       { padding: Spacing.md, borderRadius: Radii.md, marginBottom: Spacing.md, borderWidth: 1 },
  noPricesText:      { fontSize: Typography.bodySmall, textAlign: 'center' },
  successBox:        { padding: Spacing.lg, borderRadius: Radii.md, marginBottom: Spacing.xl, borderWidth: 1 },
  successText:       { fontSize: Typography.body, textAlign: 'center' },
  scanBtnSpacing:    { marginTop: Spacing.sm },
  scanBtnLabel:      { fontSize: Typography.body, fontWeight: '700', fontFamily: 'Inter' },
  scanningLabel:     { fontSize: Typography.bodySmall, fontWeight: '500', marginBottom: Spacing.xs },
  storeIndicatorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  changeStoreText:   { fontSize: Typography.bodySmall, fontFamily: 'Inter' },
  cameraControlsRow: { position: 'absolute', bottom: Spacing.xxl, alignSelf: 'center', flexDirection: 'column', alignItems: 'center', gap: Spacing.sm },
  storeError:        { fontSize: Typography.bodySmall, textAlign: 'center', marginBottom: Spacing.sm },
  separator:         { textAlign: 'center', fontSize: Typography.bodySmall, marginTop: Spacing.xl, marginBottom: Spacing.md },
});
