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

import { confirmPrice, deduplicateByStoreAndPrice, flagPrice } from '@/services/priceService';
import { PriceEntry } from '@/types/index';
import { useRef } from 'react';

type ShowAlert = (config: {
  title: string;
  message?: string;
  buttons: Array<{ text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }>;
}) => void;

interface UsePriceActionsProps {
  priceEntries: PriceEntry[];
  updatePriceEntries: (updater: (prev: PriceEntry[]) => PriceEntry[]) => void;
  showAlert: ShowAlert;
}

export function usePriceActions({ priceEntries, updatePriceEntries, showAlert }: UsePriceActionsProps) {
  const priceEntriesRef = useRef(priceEntries);
  priceEntriesRef.current = priceEntries;

  const handleConfirmPrice = async (entryId: number) => {
    const entry = priceEntries.find(e => e.id === entryId);
    if (!entry) return;

    try {
      await confirmPrice(entryId, entry.confirms);
      // Bug #7: re-sort after confirms changes the ordering
      updatePriceEntries(prev =>
        deduplicateByStoreAndPrice(
          prev.map(e => e.id === entryId ? { ...e, confirms: e.confirms + 1 } : e)
        )
      );
      showAlert({ title: '👍 Thanks!', message: 'You confirmed this price is correct.', buttons: [{ text: 'OK' }] });
    } catch {
      showAlert({ title: 'Error', message: 'Could not confirm price. Please try again.', buttons: [{ text: 'OK' }] });
    }
  };

  const handleFlagPrice = (entryId: number) => {
    showAlert({
      title: '🚩 Flag this price',
      message: 'Is this price incorrect or suspicious?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, flag it',
          style: 'destructive',
          onPress: async () => {
            const entry = priceEntriesRef.current.find(e => e.id === entryId);
            if (!entry) return;

            try {
              const { hidden } = await flagPrice(entryId, entry.flags);
              if (hidden) {
                updatePriceEntries(prev => prev.filter(e => e.id !== entryId));
                showAlert({ title: '✅ Reported', message: 'This price has been hidden pending review. Thank you!', buttons: [{ text: 'OK' }] });
              } else {
                // Bug #7: re-sort after flags changes the ordering
                updatePriceEntries(prev =>
                  deduplicateByStoreAndPrice(
                    prev.map(e => e.id === entryId ? { ...e, flags: e.flags + 1 } : e)
                  )
                );
                showAlert({ title: '✅ Reported', message: 'Thank you for helping keep our data accurate!', buttons: [{ text: 'OK' }] });
              }
            } catch {
              showAlert({ title: 'Error', message: 'Could not flag price. Please try again.', buttons: [{ text: 'OK' }] });
            }
          },
        },
      ],
    });
  };

  return { handleConfirmPrice, handleFlagPrice };
}
