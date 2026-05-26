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
import { Radii, Spacing, TouchTargets, Typography } from '@/constants/theme';
import { useNetwork } from '@/hooks/useNetwork';
import { usePrices } from '@/hooks/usePrices';
import { useTheme } from '@/hooks/useTheme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {
  ActivityIndicator, Button, Image, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { isOnline } = useNetwork();
  const { colors } = useTheme();
  const {
    priceEntries, product, price, selectedStore, setSelectedStore,
    submitted, saving, aiLoading, error, loading,
    lookUpProduct, handleSubmitPrice, handleConfirmPrice, handleFlagPrice,
    handleScanPriceTag, handleAddToBasket, handlePriceChange, resetScan,
  } = usePrices();

  const s = styles(colors);

  if (!permission) return <View style={s.safe} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.centred}>
          <Text style={s.message}>We need camera permission to scan barcodes</Text>
          <Button title="Grant Permission" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.container}>

          {scanning && (
            <CameraView
              style={s.camera}
              onBarcodeScanned={({ data }) => { setScanning(false); lookUpProduct(data); }}
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
            />
          )}

          {!scanning && (
            <>
              {/* Header */}
              <View style={s.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Image
                    source={require('@/assets/images/tralai_cliste_app_logo_outline_no_bg.png')}
                    style={{ width: 45, height: 45, borderRadius: 8 }}
                    //resizeMode="contain"
                  />
                  <Text style={s.title}>Tralaí Cliste</Text>
                </View>
                <View style={[s.onlinePill, !isOnline && s.offlinePill]}>
                  <Text style={[s.onlinePillText, !isOnline && s.offlinePillText]}>
                    {isOnline ? '● Online' : '● Offline'}
                  </Text>
                </View>
              </View>

              <OfflineBanner isOnline={isOnline} />

              {/* Scan area when no product */}
              {!product && !loading && (
                <View style={s.scanArea}>
                  <Text style={s.scanIcon}>⬚</Text>
                  <Text style={s.scanText}>Point camera at barcode or price tag</Text>
                </View>
              )}

              {loading && (
                <View style={s.loadingRow}>
                  <ActivityIndicator size="large" color={colors.primaryGreen} />
                  <Text style={s.message}>Looking up product...</Text>
                </View>
              )}

              {!!error && (
                <View style={s.errorBox}>
                  <Text style={s.error}>{error}</Text>
                </View>
              )}

              <PriceList
                entries={priceEntries}
                onConfirm={handleConfirmPrice}
                onFlag={handleFlagPrice}
                onAddToBasket={handleAddToBasket}
              />

              {priceEntries.length === 0 && !!product && !loading && (
                <View style={s.noPricesBox}>
                  <Text style={s.noPricesText}>
                    📭 No prices yet for this product — be the first!
                  </Text>
                </View>
              )}

              {submitted && (
                <View style={s.successBox}>
                  <Text style={s.successText}>
                    ✅ Price saved! Thank you for helping the community!
                  </Text>
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
                />
              )}

              <TouchableOpacity
                style={s.scanBtnContainer}
                onPress={() => { resetScan(); setScanning(true); }}
                activeOpacity={0.85}
              >
                <Text style={s.scanBtnText}>
                  {product ? 'Scan Another Product' : 'Scan a Product'}
                </Text>
              </TouchableOpacity>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (c: ReturnType<typeof import('@/hooks/useTheme').useTheme>['colors']) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    container: { flexGrow: 1, padding: Spacing.xl, backgroundColor: c.background },
    centred: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
    camera: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: 600 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
    title: { fontSize: Typography.heading2, fontWeight: '700', color: c.textPrimary },
    onlinePill: { backgroundColor: c.greenLight, paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radii.pill, borderWidth: 0.5, borderColor: c.primaryGreen },
    offlinePill: { backgroundColor: c.errorBg, borderColor: c.error },
    onlinePillText: { fontSize: Typography.tiny, color: c.primaryGreen, fontWeight: '600' },
    offlinePillText: { color: c.error },
    scanArea: { backgroundColor: c.surfaceAlt, borderWidth: 1.5, borderColor: c.primaryGreen, borderStyle: 'dashed', borderRadius: Radii.lg, padding: Spacing.xxl, alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg, minHeight: 160, justifyContent: 'center' },
    scanIcon: { fontSize: 40, color: c.primaryGreen },
    scanText: { fontSize: Typography.body, color: c.textSecondary, textAlign: 'center' },
    loadingRow: { alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.xl },
    message: { fontSize: Typography.body, color: c.textSecondary, textAlign: 'center' },
    errorBox: { backgroundColor: c.errorBg, padding: Spacing.md, borderRadius: Radii.sm, marginBottom: Spacing.md, borderWidth: 0.5, borderColor: c.errorBorder },
    error: { fontSize: Typography.bodySmall, color: c.error, textAlign: 'center' },
    noPricesBox: { backgroundColor: c.surfaceAlt, padding: Spacing.md, borderRadius: Radii.md, marginBottom: Spacing.md, borderWidth: 0.5, borderColor: c.borderStrong },
    noPricesText: { color: c.primaryGreen, fontSize: Typography.bodySmall, textAlign: 'center' },
    successBox: { backgroundColor: c.infoBg, padding: Spacing.lg, borderRadius: Radii.md, marginBottom: Spacing.xl, borderWidth: 0.5, borderColor: c.success },
    successText: { color: c.success, fontSize: Typography.body, textAlign: 'center' },
    scanBtnContainer: { width: '100%', marginTop: Spacing.sm, minHeight: TouchTargets.minHeight, backgroundColor: c.primaryGreen, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center' },
    scanBtnText: { color: '#FFFFFF', fontSize: Typography.body, fontWeight: '600', textTransform: 'none' },
  });
