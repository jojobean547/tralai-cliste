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
import { deduplicateByStoreAndPrice, fetchPrices, submitPrice } from '@/services/priceService';
import { PriceEntry, PriceSubmission, Product } from '@/types/index';
import { useCallback, useEffect, useRef, useState } from 'react';

type PendingSubmission = PriceSubmission & { id: string };

type ShowAlert = (config: {
  title: string;
  message?: string;
  buttons: Array<{ text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }>;
}) => void;

interface UsePriceSubmissionProps {
  product: Product | null;
  priceEntries: PriceEntry[];
  updatePriceEntries: (updater: (prev: PriceEntry[]) => PriceEntry[]) => void;
  showAlert: ShowAlert;
}

export function usePriceSubmission({
  product,
  priceEntries,
  updatePriceEntries,
  showAlert,
}: UsePriceSubmissionProps) {
  const [price, setPrice] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clubCardPrice, setClubCardPrice] = useState('');
  const [clubCardName, setClubCardName] = useState('');
  const [dealQuantity, setDealQuantity] = useState(1);
  const [dealTotal, setDealTotal] = useState<number | null>(null);
  const [dealPrice, setDealPrice] = useState<number | null>(null);
  const [dealText, setDealText] = useState('');
  const [error, setError] = useState('');

  const { isOnline } = useNetwork();
  const { isGuest } = useAuth();
  const { addItem, basket } = useBasket();
  const {
    addPendingSubmission,
    getPendingSubmissions,
    removePendingSubmission,
    cachePrices,
  } = useProductCache();

  const getPendingRef = useRef(getPendingSubmissions);
  getPendingRef.current = getPendingSubmissions;
  const removePendingRef = useRef(removePendingSubmission);
  removePendingRef.current = removePendingSubmission;

  // Sync queued offline submissions when coming back online
  useEffect(() => {
    if (!isOnline) return;
    const pending = getPendingRef.current() as PendingSubmission[];
    if (pending.length === 0) return;

    (async () => {
      for (const sub of pending) {
        try {
          await submitPrice({
            barcode: sub.barcode,
            product_name: sub.product_name,
            store_name: sub.store_name,
            price: sub.price,
          });
          removePendingRef.current(sub.id);
        } catch {
          // Leave in queue for next sync attempt
        }
      }
    })();
  }, [isOnline]);

  // ─── Price submission ──────────────────────────────────────────────────────

  const proceedWithSubmit = async (parsedPrice: number) => {
    if (!product) return;
    setSaving(true);
    setError('');

    try {
      const parsedClubCardPrice = clubCardPrice ? parseFloat(clubCardPrice.replace(',', '.')) : null;
      const resolvedClubCardName = clubCardName || null;

      if (!isOnline) {
        addPendingSubmission({
          barcode: product.barcode,
          product_name: product.product_name || 'Unknown',
          store_name: selectedStore,
          price: parsedPrice,
          deal: dealTotal !== null && dealText ? dealText : null,
          deal_price: dealPrice ?? null,
        });
        setSubmitted(true);
        return;
      }

      await submitPrice({
        barcode: product.barcode,
        product_name: product.product_name || 'Unknown',
        store_name: selectedStore,
        price: parsedPrice,
        deal: dealTotal !== null && dealText ? dealText : null,
        deal_price: dealPrice ?? null,
        club_card_price: parsedClubCardPrice,
        club_card_name: resolvedClubCardName,
      });
      setSubmitted(true);

      const prices = await fetchPrices(product.barcode);
      if (prices.length > 0) {
        updatePriceEntries(() => deduplicateByStoreAndPrice(prices));
        cachePrices(product.barcode, prices);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPrice = () => {

    // TEMP: remove before launch
    /*if (isGuest) {
      setError('Please sign in to submit prices');
      return;
    }*/

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

    if (priceEntries.length >= 2) {
      const avg = priceEntries.reduce((sum, e) => sum + e.price, 0) / priceEntries.length;
      if (parsedPrice > avg * 3 || parsedPrice < avg / 3) {
        showAlert({
          title: '⚠️ Unusual price',
          message: `The average price for this product is €${avg.toFixed(2)}. You entered €${parsedPrice.toFixed(2)}.\n\nAre you sure this is correct?`,
          buttons: [
            { text: 'Yes, submit anyway', onPress: () => proceedWithSubmit(parsedPrice) },
            { text: 'Let me check', style: 'cancel' },
          ],
        });
        return;
      }
    }

    proceedWithSubmit(parsedPrice);
  };

  // ─── Basket ────────────────────────────────────────────────────────────────

  const handleAddToBasket = (entry: PriceEntry) => {
    if (!product) return;

    const alreadyInBasket = basket.some(
      item => item.barcode === product.barcode && item.store_name === entry.store_name
    );
    if (alreadyInBasket) {
      showAlert({ title: 'Already in basket', message: 'This item from this store is already in your basket.', buttons: [{ text: 'OK' }] });
      return;
    }

    addItem({
      barcode: product.barcode,
      product_name: product.product_name || 'Unknown product',
      image_url: product.image_url || null,
      store_name: entry.store_name,
      price: entry.price,
      quantity: dealQuantity,
      dealTotal: dealTotal ?? undefined,
      deal: entry.deal ?? null,
      club_card_price: entry.club_card_price ?? null,
      club_card_name: entry.club_card_name ?? null,
      deal_price: entry.deal_price ?? null,
    });

    const msg = dealQuantity > 1
      ? `${product.product_name} × ${dealQuantity} added (deal quantity)`
      : `${product.product_name} added to your basket.`;

    showAlert({ title: 'Added! 🛒', message: msg, buttons: [{ text: 'OK' }] });
    setDealQuantity(1);
  };

  // ─── Reset ─────────────────────────────────────────────────────────────────

  const resetForNewScan = useCallback(() => {
    setPrice('');
    setSubmitted(false);
    setDealQuantity(1);
    setDealTotal(null);
    setDealPrice(null);
    setDealText('');
    setError('');
  }, []);

  const resetSubmission = useCallback(() => {
    setPrice('');
    setSubmitted(false);
    setSaving(false);
    setClubCardPrice('');
    setClubCardName('');
    setDealQuantity(1);
    setDealTotal(null);
    setDealPrice(null);
    setDealText('');
    setError('');
  }, []);

  const handlePriceChange = (text: string) => {
    setPrice(text);
    setDealTotal(null);
  };

  return {
    price,
    selectedStore,
    setSelectedStore,
    submitted,
    saving,
    clubCardPrice,
    setClubCardPrice,
    clubCardName,
    setClubCardName,
    dealQuantity,
    dealTotal,
    dealPrice,
    setDealPrice,
    dealText,
    setDealText,
    error,
    handleSubmitPrice,
    handleAddToBasket,
    handlePriceChange,
    resetForNewScan,
    resetSubmission,
  };
}
