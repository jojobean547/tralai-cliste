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
import { useNetwork } from '@/hooks/useNetwork';
import { usePrices } from '@/hooks/usePrices';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function HomeScreen() {
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { isOnline } = useNetwork();
  const {
    priceEntries, product, price, selectedStore, setSelectedStore,
    submitted, saving, aiLoading, error, loading,
    lookUpProduct, handleSubmitPrice, handleConfirmPrice, handleFlagPrice,
    handleScanPriceTag, handleAddToBasket, handlePriceChange, resetScan,
  } = usePrices();

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera permission to scan barcodes</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>

        {scanning && (
          <CameraView
            style={styles.camera}
            onBarcodeScanned={({ data }) => { setScanning(false); lookUpProduct(data); }}
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
          />
        )}

        {!scanning && (
          <>
            <Text style={styles.title}>🛒 Tralaí Cliste</Text>

            <OfflineBanner isOnline={isOnline} />

            {loading && (
              <>
                <ActivityIndicator size="large" color="#2ecc71" />
                <Text style={styles.message}>Looking up product...</Text>
              </>
            )}

            {!!error && <Text style={styles.error}>{error}</Text>}

            <PriceList
              entries={priceEntries}
              onConfirm={handleConfirmPrice}
              onFlag={handleFlagPrice}
              onAddToBasket={handleAddToBasket}
            />

            {priceEntries.length === 0 && !!product && !loading && (
              <View style={styles.noPricesBox}>
                <Text style={styles.noPricesText}>📭 No prices yet for this product — be the first!</Text>
              </View>
            )}

            {submitted && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>✅ Price saved! Thank you for helping the community!</Text>
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

            <View style={styles.buttonContainer}>
              <Button
                title={product ? 'Scan Another' : 'Scan a Product'}
                onPress={() => { resetScan(); setScanning(true); }}
              />
            </View>
          </>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  camera: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: 600 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  message: { fontSize: 16, marginBottom: 30, color: '#444' },
  error: { fontSize: 14, color: 'red', marginBottom: 16, textAlign: 'center' },
  successBox: { backgroundColor: '#d4edda', padding: 16, borderRadius: 10, marginBottom: 20, width: '100%' },
  successText: { color: '#155724', fontSize: 15, textAlign: 'center' },
  noPricesBox: { backgroundColor: '#fff8e1', padding: 14, borderRadius: 10, marginBottom: 16, width: '100%' },
  noPricesText: { color: '#856404', fontSize: 14, textAlign: 'center' },
  buttonContainer: { width: '100%', marginTop: 10 },
});
