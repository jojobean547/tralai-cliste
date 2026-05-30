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

import { PriceEntry, PriceSubmission } from '@/types/index';
import { supabase } from '@/services/supabase';

export function deduplicateByStoreAndPrice(prices: PriceEntry[]): PriceEntry[] {
  const seen = new Set<string>();

  return prices
    .filter(entry => {
      const key = `${entry.store_name}-${entry.price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      if (a.price !== b.price) return a.price - b.price;
      if (b.confirms !== a.confirms) return b.confirms - a.confirms;
      if (a.flags !== b.flags) return a.flags - b.flags;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}

export async function fetchPrices(barcode: string): Promise<PriceEntry[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('prices')
    .select('id, store_name, price, created_at, confirms, flags, deal, deal_price, club_card_price, club_card_name')
    .eq('barcode', barcode)
    .eq('status', 'active')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data as PriceEntry[]) ?? [];
}

export async function submitPrice(submission: PriceSubmission): Promise<void> {
  const { error } = await supabase.from('prices').insert(submission);

  if (error) {
    if (error.message.includes('Duplicate price submission')) {
      throw new Error('You already submitted a price for this product in this store today. Thank you! 😊');
    }
    throw new Error(error.message);
  }
}

export async function confirmPrice(entryId: number, currentConfirms: number): Promise<void> {
  const { error } = await supabase
    .from('prices')
    .update({ confirms: currentConfirms + 1 })
    .eq('id', entryId);

  if (error) throw new Error(error.message);
}

export async function flagPrice(
  entryId: number,
  currentFlags: number
): Promise<{ hidden: boolean }> {
  const newFlags = currentFlags + 1;
  const hidden = newFlags >= 3;

  const { error } = await supabase
    .from('prices')
    .update({ flags: newFlags, status: hidden ? 'hidden' : 'active' })
    .eq('id', entryId);

  if (error) throw new Error(error.message);

  return { hidden };
}
