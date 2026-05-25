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
import { STORES } from '@/constants/stores';
import { Product } from '@/types/index';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
};

export default function ProductCard({
  product,
  price,
  onPriceChange,
  onScanTag,
  aiLoading,
  selectedStore,
  onStoreSelect,
  onSubmit,
  saving,
}: Props) {
  return (
    <View style={styles.card}>
      {!!product.image_url && (
        <Image source={{ uri: product.image_url }} style={styles.image} />
      )}

      <Text style={styles.name}>{product.product_name || 'Unknown product'}</Text>
      <Text style={styles.brand}>{product.brands || ''}</Text>
      <Text style={styles.quantity}>{product.quantity || ''}</Text>

      <Text style={styles.sectionLabel}>What's the price? (€)</Text>
      <TextInput
        style={styles.priceInput}
        keyboardType="decimal-pad"
        placeholder="e.g. 3.50"
        value={price}
        onChangeText={onPriceChange}
      />

      <TouchableOpacity
        style={styles.scanButton}
        onPress={onScanTag}
        disabled={aiLoading}
      >
        {aiLoading ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.scanButtonText}> AI reading price...</Text>
          </>
        ) : (
          <Text style={styles.scanButtonText}>📷 Scan Price Tag Instead</Text>
        )}
      </TouchableOpacity>

      <StoreSelector
        stores={STORES}
        selectedStore={selectedStore}
        onSelect={onStoreSelect}
      />

      <TouchableOpacity style={styles.submitButton} onPress={onSubmit} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Price 💾</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 12,
    alignSelf: 'center',
  },
  name: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  brand: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 2 },
  quantity: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 16 },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 12,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    width: '100%',
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  scanButton: {
    backgroundColor: '#9b59b6',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scanButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
