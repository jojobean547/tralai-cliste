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

// Internal — individual units expanded from a basket entry for deal grouping
type ExpandedUnit = BasketItem & { unitIndex: number };

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

  // "3 for €10", "2 for€4.99" — strip currency so spacing is irrelevant
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

export function getEffectivePrice(
  item: BasketItem,
  hasClubCard: (name: string) => boolean,
): number {
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
}

export function detectMixedDeals(basket: BasketItem[]): MixedDealGroup[] {
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
      const completeGroups = Math.floor(n / parsed.buyQty);
      if (completeGroups === 0) continue;
      const freePerGroup = parsed.buyQty - (parsed.payQty ?? parsed.buyQty - 1);
      const leftover = n % parsed.buyQty;
      const sortedAsc = [...expandedItems].sort((a, b) => a.price - b.price);
      const freeItems = sortedAsc.slice(0, completeGroups * freePerGroup) as BasketItem[];
      const saving = freeItems.reduce((s, u) => s + u.price, 0);

      result.push({
        id: key,
        dealText,
        dealType: 'quantity',
        store,
        items: ([...expandedItems].sort((a, b) => b.price - a.price)) as BasketItem[],
        freeItems,
        completeGroups,
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

export function getMixedDealPriceForItem(
  item: BasketItem,
  mixedDealGroups: MixedDealGroup[],
): DealPriceInfo | null {
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
}
