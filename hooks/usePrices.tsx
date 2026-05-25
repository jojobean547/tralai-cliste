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

import { useAuth } from '@/hooks/useAuth';
import { useBasket } from '@/hooks/useBasket';
import { useNetwork } from '@/hooks/useNetwork';
import { useProductCache } from '@/hooks/useProductCache';
import { extractDealInfo, scanPriceTag } from '@/services/aiService';
import {
  confirmPrice,
  deduplicateByStoreAndPrice,
  fetchPrices,
  flagPrice,
  submitPrice,
} from '@/services/priceService';
import { fetchProduct } from '@/services/productService';
import { PriceEntry, PriceSubmission, Product } from '@/types/index';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

type PendingSubmission = PriceSubmission & { id: string };

export function usePrices() {
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [price, setPrice] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [dealQuantity, setDealQuantity] = useState(1);
  const [dealTotal, setDealTotal] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const scanInProgressRef = useRef(false);

  const { addItem, basket } = useBasket();
  const { isOnline } = useNetwork();
  const { isGuest } = useAuth();
  const {
    getCachedProduct,
    cacheProduct,
    getCachedPrices,
    cachePrices,
    addPendingSubmission,
    getPendingSubmissions,
    removePendingSubmission,
  } = useProductCache();

  // Sync queued offline submissions when coming back online
  useEffect(() => {
    if (!isOnline) return;
    const pending = getPendingSubmissions() as PendingSubmission[];
    if (pending.length === 0) return;

    pending.forEach(async (sub) => {
      try {
        await submitPrice({
          barcode: sub.barcode,
          product_name: sub.product_name,
          store_name: sub.store_name,
          price: sub.price,
        });
        removePendingSubmission(sub.id);
      } catch {
        // Leave in queue for next sync attempt
      }
    });
  }, [isOnline]);

  // ─── Product + price lookup ────────────────────────────────────────────────

  const lookUpProduct = async (barcode: string) => {
    // Bug #5: ref guard prevents concurrent lookups
    if (scanInProgressRef.current) return;
    scanInProgressRef.current = true;

    setLoading(true);
    setError('');
    setProduct(null);
    setPrice('');
    setSelectedStore('');
    setSubmitted(false);
    setDealQuantity(1);
    setPriceEntries([]);
    setDealTotal(null);

    const cachedProduct = getCachedProduct(barcode) as Product | null;
    const cachedPrices = getCachedPrices(barcode) as PriceEntry[];

    try {
      if (cachedProduct) setProduct({ ...cachedProduct, barcode });
      if (cachedPrices.length > 0) setPriceEntries(cachedPrices);

      if (!isOnline) {
        setError(
          cachedProduct
            ? '📡 You\'re offline — showing cached data. Prices may not be up to date.'
            : '📡 You\'re offline. This product hasn\'t been scanned before so we don\'t have it cached yet.'
        );
        return;
      }

      // Fetch product from Open Food Facts — parse errors return null, network errors throw
      try {
        const freshProduct = await fetchProduct(barcode);
        if (freshProduct) {
          setProduct(freshProduct);
          cacheProduct(barcode, freshProduct);
        } else if (!cachedProduct) {
          setError('Product not found in database');
        }
      } catch {
        if (!cachedProduct) {
          setError('🔧 Product database is temporarily unavailable. Please try again later.');
        }
      }

      // Fetch community prices from Supabase
      try {
        const prices = await fetchPrices(barcode);
        if (prices.length > 0) {
          setPriceEntries(deduplicateByStoreAndPrice(prices));
          cachePrices(barcode, prices);
        }
      } catch {
        if (!cachedPrices.length) {
          setError('🌐 Could not connect. Check your internet connection.');
        }
      }
    } finally {
      setLoading(false);
      scanInProgressRef.current = false; // always reset — fixes offline early-return leak
    }
  };

  // ─── Price submission ──────────────────────────────────────────────────────

  const proceedWithSubmit = async (parsedPrice: number) => {
    if (!product) return;
    setSaving(true);
    setError('');

    try {
      if (!isOnline) {
        addPendingSubmission({
          barcode: product.barcode,
          product_name: product.product_name || 'Unknown',
          store_name: selectedStore,
          price: parsedPrice,
        });
        setSubmitted(true);
        return;
      }

      await submitPrice({
        barcode: product.barcode,
        product_name: product.product_name || 'Unknown',
        store_name: selectedStore,
        price: parsedPrice,
      });
      setSubmitted(true);

      const prices = await fetchPrices(product.barcode);
      if (prices.length > 0) {
        setPriceEntries(deduplicateByStoreAndPrice(prices));
        cachePrices(product.barcode, prices);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPrice = () => {
    if (isGuest) {
      Alert.alert(
        '👋 Sign in to contribute',
        'Guest users can view prices but signing in lets you submit prices and help the community.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!price || !selectedStore) {
      setError('Please enter a price and select a store');
      return;
    }

    const parsedPrice = parseFloat(price);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid price');
      return;
    }

    if (parsedPrice >= 500) {
      setError('Price seems too high — is this a grocery item?');
      return;
    }

    if (parsedPrice <= 0.01) {
      setError('Price seems too low — please check and try again');
      return;
    }

    if (priceEntries.length > 2) {
      const avg = priceEntries.reduce((sum, e) => sum + e.price, 0) / priceEntries.length;
      if (parsedPrice > avg * 3 || parsedPrice < avg / 3) {
        Alert.alert(
          '⚠️ Unusual price',
          `The average price for this product is €${avg.toFixed(2)}. You entered €${parsedPrice.toFixed(2)}.\n\nAre you sure this is correct?`,
          [
            { text: 'Yes, submit anyway', onPress: () => proceedWithSubmit(parsedPrice) },
            { text: 'Let me check', style: 'cancel' },
          ]
        );
        return;
      }
    }

    proceedWithSubmit(parsedPrice);
  };

  // ─── Confirm / flag ────────────────────────────────────────────────────────

  const handleConfirmPrice = async (entryId: number) => {
    const entry = priceEntries.find(e => e.id === entryId);
    if (!entry) return;

    try {
      await confirmPrice(entryId, entry.confirms);
      // Bug #7: re-sort after confirms changes the ordering
      setPriceEntries(prev =>
        deduplicateByStoreAndPrice(
          prev.map(e => e.id === entryId ? { ...e, confirms: entry.confirms + 1 } : e)
        )
      );
      Alert.alert('👍 Thanks!', 'You confirmed this price is correct.');
    } catch {
      Alert.alert('Error', 'Could not confirm price. Please try again.');
    }
  };

  const handleFlagPrice = (entryId: number) => {
    Alert.alert(
      '🚩 Flag this price',
      'Is this price incorrect or suspicious?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, flag it',
          style: 'destructive',
          onPress: async () => {
            const entry = priceEntries.find(e => e.id === entryId);
            if (!entry) return;

            try {
              const { hidden } = await flagPrice(entryId, entry.flags);
              if (hidden) {
                setPriceEntries(prev => prev.filter(e => e.id !== entryId));
                Alert.alert('✅ Reported', 'This price has been hidden pending review. Thank you!');
              } else {
                // Bug #7: re-sort after flags changes the ordering
                setPriceEntries(prev =>
                  deduplicateByStoreAndPrice(
                    prev.map(e => e.id === entryId ? { ...e, flags: entry.flags + 1 } : e)
                  )
                );
                Alert.alert('✅ Reported', 'Thank you for helping keep our data accurate!');
              }
            } catch {
              Alert.alert('Error', 'Could not flag price. Please try again.');
            }
          },
        },
      ]
    );
  };

  // ─── AI price tag scan ─────────────────────────────────────────────────────

  const handleScanPriceTag = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to scan price tags.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 });
    if (result.canceled || !result.assets?.length || !result.assets[0].base64) return;

    setAiLoading(true);
    setError('');

    try {
      const priceData = await scanPriceTag(result.assets[0].base64);
      setPrice(String(priceData.single_price));

      let message = `Single price: €${priceData.single_price}`;
      if (priceData.has_deal && priceData.deal) {
        message += `\n\n🏷️ Deal found: ${priceData.deal}`;
        if (priceData.deal_price_per_item) {
          message += `\n💰 Price per item with deal: €${priceData.deal_price_per_item.toFixed(2)}`;
        }
        message += `\n\nThe single price has been filled in. You can change it to the deal price per item if you prefer.`;
      } else {
        message += `\n\nDoes this look right? You can correct it before submitting.`;
      }

      Alert.alert('💰 Price detected!', message, [
        { text: 'Use single price', style: 'default' },
        priceData.deal_price_per_item
          ? {
              text: `Use deal price (€${priceData.deal_price_per_item.toFixed(2)})`,
              onPress: () => {
                const { quantity, totalPrice } = extractDealInfo(
                  priceData.deal || '',
                  priceData.deal_price_per_item!,
                  priceData.single_price
                );
                const safeQuantity = Math.min(quantity, 20); // Bug #16: cap AI-returned quantity
                setPrice(String(priceData.deal_price_per_item!.toFixed(2)));
                setDealQuantity(safeQuantity);
                setDealTotal(totalPrice);
                if (safeQuantity > 1) {
                  Alert.alert(
                    '🛒 Deal quantity set!',
                    `Quantity set to ${safeQuantity}.\nBasket total will show exactly €${totalPrice.toFixed(2)}`,
                    [{ text: 'Perfect!', style: 'default' }]
                  );
                }
              },
            }
          : { text: 'OK', style: 'default' },
      ]);
    } catch (e: any) {
      Alert.alert('Could not read price', e.message || 'Please try again or enter manually.');
    } finally {
      setAiLoading(false);
    }
  };

  // ─── Basket ────────────────────────────────────────────────────────────────

  const handleAddToBasket = (entry: PriceEntry) => {
    if (!product) return;

    const alreadyInBasket = basket.some(
      item => item.barcode === product.barcode && item.store_name === entry.store_name
    );
    if (alreadyInBasket) {
      Alert.alert('Already in basket', 'This item from this store is already in your basket.');
      return;
    }

    addItem({
      barcode: product.barcode,
      product_name: product.product_name || 'Unknown product',
      image_url: product.image_url || null,
      store_name: entry.store_name,
      price: entry.price,
      quantity: dealQuantity,
      dealTotal: dealTotal || undefined,
    } as any);

    const msg = dealQuantity > 1
      ? `${product.product_name} × ${dealQuantity} added (deal quantity)`
      : `${product.product_name} added to your basket.`;

    Alert.alert('Added! 🛒', msg);
    setDealQuantity(1);
  };

  // ─── Reset ─────────────────────────────────────────────────────────────────

  const resetScan = () => {
    setProduct(null);
    setError('');
    setSubmitted(false);
    setPriceEntries([]);
    setPrice('');
    setSelectedStore('');
    setDealQuantity(1);
    setDealTotal(null);
  };

  const handlePriceChange = (text: string) => {
    setPrice(text);
    setDealTotal(null);
  };

  return {
    // State
    priceEntries,
    product,
    price,
    selectedStore,
    setSelectedStore,
    submitted,
    saving,
    aiLoading,
    dealQuantity,
    dealTotal,
    error,
    loading,
    // Handlers
    lookUpProduct,
    handleSubmitPrice,
    handleConfirmPrice,
    handleFlagPrice,
    handleScanPriceTag,
    handleAddToBasket,
    handlePriceChange,
    resetScan,
  };
}
