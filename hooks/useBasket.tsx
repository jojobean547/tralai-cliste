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

import {
  detectMixedDeals,
  getEffectivePrice,
  getMixedDealPriceForItem,
  parseDeal,
  type BasketItem,
  type DealPriceInfo,
  type MixedDealGroup,
} from '@/hooks/useDealCalculator';
export type { BasketItem, DealPriceInfo, MixedDealGroup } from '@/hooks/useDealCalculator';
export { parseDeal } from '@/hooks/useDealCalculator';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

type BasketContextType = {
  basket: BasketItem[];
  addItem: (item: Omit<BasketItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (barcode: string, store_name: string) => void;
  updateQuantity: (barcode: string, store_name: string, quantity: number) => void;
  clearBasket: () => void;
  total: number;
  itemCount: number;
  mixedDealGroups: MixedDealGroup[];
  getMixedDealPriceForItem: (item: BasketItem) => DealPriceInfo | null;
};

const BasketContext = createContext<BasketContextType | null>(null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const { hasClubCard } = useUserPreferences();
  const [mixedDealGroups, setMixedDealGroups] = useState<MixedDealGroup[]>([]);

  const addItem = (item: Omit<BasketItem, 'quantity'> & { quantity?: number }) => {
    setBasket(prev => {
      const existing = prev.find(
        i => i.barcode === item.barcode && i.store_name === item.store_name
      );
      if (existing) {
        return prev.map(i =>
          i.barcode === item.barcode && i.store_name === item.store_name
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeItem = (barcode: string, store_name: string) => {
    setBasket(prev =>
      prev.filter(i => !(i.barcode === barcode && i.store_name === store_name))
    );
  };

  const updateQuantity = (barcode: string, store_name: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(barcode, store_name);
      return;
    }
    setBasket(prev =>
      prev.map(i =>
        i.barcode === barcode && i.store_name === store_name
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearBasket = () => setBasket([]);

  // Re-run deal detection only when deal-relevant basket fields change.
  // useCallback captures current basket; JSON.stringify dep avoids re-running
  // on unrelated state updates (e.g. price-only refreshes).
  const computeDeals = useCallback(() => {
    setMixedDealGroups(detectMixedDeals(basket));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basket]);

  useEffect(() => {
    computeDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(basket.map(i => `${i.barcode}-${i.store_name}-${i.quantity}-${i.deal}`))]);

  const mixedSaving = mixedDealGroups.reduce((sum, g) => sum + g.totalSaving, 0);
  const total = basket.reduce((sum, item) => sum + getEffectivePrice(item, hasClubCard), 0) - mixedSaving;
  const itemCount = basket.reduce((sum, item) => sum + item.quantity, 0);

  // Returns a full deal breakdown for an item in a mixed deal group, or null.
  // Only returned when ALL of the item's units are accounted for in the group
  // (avoids partial displays when getEffectivePrice already handles some units).
  const getMixedDealPriceForItemCallback = useCallback((item: BasketItem): DealPriceInfo | null => {
    return getMixedDealPriceForItem(item, mixedDealGroups);
  }, [mixedDealGroups]);

  return (
    <BasketContext.Provider value={{
      basket, addItem, removeItem, updateQuantity, clearBasket,
      total, itemCount, mixedDealGroups,
      getMixedDealPriceForItem: getMixedDealPriceForItemCallback,
    }}>
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) throw new Error('useBasket must be used within a BasketProvider');
  return context;
}
