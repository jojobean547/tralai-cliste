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

import { useNetwork } from '@/hooks/useNetwork';
import { useProductCache } from '@/hooks/useProductCache';
import { deduplicateByStoreAndPrice, fetchPrices } from '@/services/priceService';
import { fetchProduct } from '@/services/productService';
import { PriceEntry, Product } from '@/types/index';
import { useCallback, useRef, useState } from 'react';

export function useProductLookup() {
  const [product, setProduct] = useState<Product | null>(null);
  const [priceEntries, setPriceEntries] = useState<PriceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scanInProgressRef = useRef(false);

  const { isOnline } = useNetwork();
  const { getCachedProduct, cacheProduct, getCachedPrices, cachePrices } = useProductCache();

  const lookUpProduct = useCallback(async (barcode: string) => {
    // Bug #5: ref guard prevents concurrent lookups
    if (scanInProgressRef.current) return;
    scanInProgressRef.current = true;

    setLoading(true);
    setError('');
    setProduct(null);
    setPriceEntries([]);

    const cachedProduct = getCachedProduct(barcode) as Product | null;
    const cachedPrices = getCachedPrices(barcode) as PriceEntry[];

    try {
      if (cachedProduct) setProduct({ ...cachedProduct, barcode });
      if (cachedPrices.length > 0) setPriceEntries(cachedPrices);

      if (!isOnline) {
        setError(
          cachedProduct
            ? "📡 You're offline — showing cached data. Prices may not be up to date."
            : "📡 You're offline. This product hasn't been scanned before so we don't have it cached yet."
        );
        return;
      }

      // Fetch product from Open Food Facts — parse errors return null, network errors throw
      try {
        const result = await fetchProduct(barcode);
        if (result) {
          setProduct(result.product);
          cacheProduct(barcode, result.product);

          // Save back to Supabase if it came from an open database
          if (result.source !== 'supabase') {
            const { submitNewProduct } = await import('@/services/productService');
            submitNewProduct({
              barcode: result.product.barcode,
              product_name: result.product.product_name ?? '',
              brands: result.product.brands,
              quantity: result.product.quantity,
              image_url: result.product.image_url,
            }, undefined, result.source).catch(() => {});
          }
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
          const deduped = deduplicateByStoreAndPrice(prices);
          setPriceEntries(deduped);
          cachePrices(barcode, deduped);
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
  }, [isOnline, getCachedProduct, cacheProduct, getCachedPrices, cachePrices]);

  const updatePriceEntries = useCallback((updater: (prev: PriceEntry[]) => PriceEntry[]) => {
    setPriceEntries(updater);
  }, []);

  const resetLookup = useCallback(() => {
    setProduct(null);
    setPriceEntries([]);
    setLoading(false);
    setError('');
    scanInProgressRef.current = false;
  }, []);

  return {
    product,
    priceEntries,
    updatePriceEntries,
    loading,
    error,
    lookUpProduct,
    resetLookup,
  };
}
