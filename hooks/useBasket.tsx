import { useUserPreferences } from '@/hooks/useUserPreferences';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export type BasketItem = {
  barcode: string;
  product_name: string;
  image_url: string | null;
  store_name: string;
  price: number;
  quantity: number;
  dealTotal?: number; // exact total when part of a deal
  deal?: string | null;
  club_card_price?: number | null;
  club_card_name?: string | null;
  deal_price?: number | null;
};

export type MixedDealGroup = {
  id: string;
  dealText: string;
  dealType: 'quantity' | 'price';
  store: string;
  items: BasketItem[];
  freeItems: BasketItem[];
  completeGroups: number;
  leftoverCount: number;
  totalSaving: number;
  dealTotal: number;
  normalTotal: number;
};

export type DealPriceInfo = {
  dealType: 'price' | 'quantity';
  dealUnits: number;       // units at the discounted / free price
  leftoverUnits: number;   // units at full price
  dealUnitPrice: number;   // per-unit price for deal units (0 for free items)
  effectiveTotal: number;  // total cost for this basket item after deal
};

type BasketContextType = {
  basket: BasketItem[];
  addItem: (item: Omit<BasketItem, 'quantity'>) => void;
  removeItem: (barcode: string, store_name: string) => void;
  updateQuantity: (barcode: string, store_name: string, quantity: number) => void;
  clearBasket: () => void;
  total: number;
  itemCount: number;
  mixedDealGroups: MixedDealGroup[];
  getMixedDealPriceForItem: (item: BasketItem) => DealPriceInfo | null;
};

const BasketContext = createContext<BasketContextType | null>(null);

export function parseDeal(dealText: string): {
  type: 'quantity' | 'price' | 'unknown';
  buyQty: number;
  payQty?: number;
  dealPrice?: number;
} {
  if (!dealText) return { type: 'unknown', buyQty: 1 };

  // "3 for 2", "2 for 1" — no currency symbol
  const quantityMatch = dealText.match(/(\d+)\s+for\s+(\d+)$/i);
  if (quantityMatch && !dealText.includes('€') && !dealText.includes('£')) {
    return {
      type: 'quantity',
      buyQty: parseInt(quantityMatch[1]),
      payQty: parseInt(quantityMatch[2]),
    };
  }

  // "Buy 2 get 1 free"
  const buyGetMatch = dealText.match(/buy\s+(\d+)\s+get\s+(\d+)/i);
  if (buyGetMatch) {
    const buy = parseInt(buyGetMatch[1]);
    const free = parseInt(buyGetMatch[2]);
    return { type: 'quantity', buyQty: buy + free, payQty: buy };
  }

  // "3 for €10", "2 for €4", "2 for€4.99" — strip currency first so spacing is irrelevant
  const cleaned = dealText.replace(/[€£$]/g, '').trim();
  const priceMatch = cleaned.match(/(\d+)\s+for\s+(\d+\.?\d*)/i);
  if (priceMatch) {
    return {
      type: 'price',
      buyQty: parseInt(priceMatch[1]),
      dealPrice: parseFloat(priceMatch[2]),
    };
  }

  return { type: 'unknown', buyQty: 1 };
}

// Internal type — each basket entry is spread into individual units with a unitIndex
// so that two units of the same product appear as distinct items in the deal group.
type ExpandedUnit = BasketItem & { unitIndex: number };

function detectMixedDeals(basket: BasketItem[]): MixedDealGroup[] {
  const groupMap = new Map<string, BasketItem[]>();

  for (const item of basket) {
    if (!item.deal) continue;
    if (item.dealTotal != null) continue;
    const key = `${item.deal}||${item.store_name}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(item);
  }

  const result: MixedDealGroup[] = [];
  for (const [key, items] of groupMap.entries()) {
    const dealText = items[0].deal ?? '';
    const store = items[0].store_name;
    const parsed = parseDeal(dealText);

    // Expand each basket entry into individual units.
    // For quantity deals where getEffectivePrice already discounts a qty-3 pack
    // (isThreeForTwo && qty >= 3), only include the leftover units (qty % 3)
    // to avoid double-counting a saving already baked into the basket total.
    const expandedItems: ExpandedUnit[] = [];
    for (const item of items) {
      const dealLower = item.deal?.toLowerCase() ?? '';
      const alreadyHandled =
        parsed.type === 'quantity' &&
        (dealLower.includes('for 2') || dealLower.includes('get 1 free')) &&
        item.quantity >= 3;
      const count = alreadyHandled ? item.quantity % 3 : item.quantity;
      for (let i = 0; i < count; i++) {
        expandedItems.push({ ...item, unitIndex: i });
      }
    }

    if (expandedItems.length < 2) continue;

    const n = expandedItems.length;
    const normalTotal = expandedItems.reduce((s, u) => s + u.price, 0);

    if (parsed.type === 'quantity') {
      const freeCount = Math.floor(n / parsed.buyQty);
      if (freeCount === 0) continue;
      const leftover = n % parsed.buyQty;
      const sortedAsc = [...expandedItems].sort((a, b) => a.price - b.price);
      const freeItems = sortedAsc.slice(0, freeCount) as BasketItem[];
      const saving = freeItems.reduce((s, u) => s + u.price, 0);

      result.push({
        id: key,
        dealText,
        dealType: 'quantity',
        store,
        items: ([...expandedItems].sort((a, b) => b.price - a.price)) as BasketItem[],
        freeItems,
        completeGroups: Math.floor(n / parsed.buyQty),
        leftoverCount: leftover,
        totalSaving: saving,
        dealTotal: normalTotal - saving,
        normalTotal,
      });

    } else if (parsed.type === 'price' && parsed.dealPrice != null && parsed.buyQty >= 2) {
      const completeGroups = Math.floor(n / parsed.buyQty);
      if (completeGroups === 0) continue;
      const leftover = n % parsed.buyQty;
      const groupsCost = completeGroups * parsed.dealPrice;
      // Most expensive units enter deal groups to maximise savings;
      // cheapest remaining units are the leftover paid at full price.
      const sortedDesc = ([...expandedItems].sort((a, b) => b.price - a.price)) as BasketItem[];
      const leftoverItems = sortedDesc.slice(completeGroups * parsed.buyQty);
      const leftoverCost = leftoverItems.reduce((s, u) => s + u.price, 0);
      const dealTotal = groupsCost + leftoverCost;
      const saving = normalTotal - dealTotal;
      if (saving <= 0) continue;

      result.push({
        id: key,
        dealText,
        dealType: 'price',
        store,
        items: sortedDesc,
        freeItems: [],
        completeGroups,
        leftoverCount: leftover,
        totalSaving: saving,
        dealTotal,
        normalTotal,
      });
    }
  }

  return result;
}

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

  const getEffectivePrice = (item: BasketItem): number => {
    if (item.club_card_price != null && item.club_card_name && hasClubCard(item.club_card_name)) {
      return item.club_card_price * item.quantity;
    }
    const deal = item.deal?.toLowerCase() ?? '';
    const isThreeForTwo = deal.includes('for 2') || deal.includes('get 1 free');
    if (isThreeForTwo && item.quantity >= 3) {
      const freeItems = Math.floor(item.quantity / 3);
      const paidItems = item.quantity - freeItems;
      return item.price * paidItems;
    }
    if (item.deal && item.dealTotal != null && item.quantity >= 3) return item.dealTotal;
    return item.price * item.quantity;
  };

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
  const total = basket.reduce((sum, item) => sum + getEffectivePrice(item), 0) - mixedSaving;
  const itemCount = basket.reduce((sum, item) => sum + item.quantity, 0);

  // Returns a full deal breakdown for an item in a mixed deal group, or null.
  // Only returned when ALL of the item's units are accounted for in the group
  // (avoids partial displays when getEffectivePrice already handles some units).
  const getMixedDealPriceForItem = useCallback((item: BasketItem): DealPriceInfo | null => {
    for (const group of mixedDealGroups) {
      const isInGroup = group.items.some(u =>
        u.barcode === item.barcode && u.store_name === item.store_name
      );
      if (!isInGroup) continue;

      if (group.dealType === 'price') {
        const parsed = parseDeal(group.dealText);
        if (parsed.dealPrice == null || parsed.buyQty < 2) continue;

        const dealGroupEndIdx = group.completeGroups * parsed.buyQty;
        const dealUnits = group.items.slice(0, dealGroupEndIdx).filter(u =>
          u.barcode === item.barcode && u.store_name === item.store_name
        ).length;
        const leftoverUnits = group.items.slice(dealGroupEndIdx).filter(u =>
          u.barcode === item.barcode && u.store_name === item.store_name
        ).length;

        // Only show mixed deal display when all item units are covered by this group
        if (dealUnits + leftoverUnits < item.quantity) continue;

        const dealUnitPrice = parsed.dealPrice / parsed.buyQty;
        return {
          dealType: 'price',
          dealUnits,
          leftoverUnits,
          dealUnitPrice,
          effectiveTotal: dealUnits * dealUnitPrice + leftoverUnits * item.price,
        };
      }

      if (group.dealType === 'quantity') {
        const freeCount = group.freeItems.filter(u =>
          u.barcode === item.barcode && u.store_name === item.store_name
        ).length;
        if (freeCount === 0) continue;

        const totalInGroup = group.items.filter(u =>
          u.barcode === item.barcode && u.store_name === item.store_name
        ).length;
        if (totalInGroup < item.quantity) continue;

        const paidCount = totalInGroup - freeCount;
        return {
          dealType: 'quantity',
          dealUnits: freeCount,
          leftoverUnits: paidCount,
          dealUnitPrice: 0,
          effectiveTotal: paidCount * item.price,
        };
      }
    }
    return null;
  }, [mixedDealGroups]);

  return (
    <BasketContext.Provider value={{
      basket, addItem, removeItem, updateQuantity, clearBasket,
      total, itemCount, mixedDealGroups, getMixedDealPriceForItem,
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
