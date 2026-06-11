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

import { useAlert } from '@/hooks/useAlert';
import { usePriceActions } from '@/hooks/usePriceActions';
import { usePriceSubmission } from '@/hooks/usePriceSubmission';
import { useProductLookup } from '@/hooks/useProductLookup';
import { useCallback } from 'react';

export function usePrices() {
  const { showAlert, alertProps } = useAlert();

  const lookup = useProductLookup();
  const submission = usePriceSubmission({
    product: lookup.product,
    priceEntries: lookup.priceEntries,
    updatePriceEntries: lookup.updatePriceEntries,
    showAlert,
  });
  const actions = usePriceActions({
    priceEntries: lookup.priceEntries,
    updatePriceEntries: lookup.updatePriceEntries,
    showAlert,
  });

  // Reset submission form state before starting a new barcode lookup
  const lookUpProduct = useCallback(async (barcode: string) => {
    submission.resetForNewScan();
    await lookup.lookUpProduct(barcode);
  }, [lookup.lookUpProduct, submission.resetForNewScan]);

  const resetScan = useCallback(() => {
    lookup.resetLookup();
    submission.resetSubmission();
  }, [lookup.resetLookup, submission.resetSubmission]);

  return {
    // State
    priceEntries: lookup.priceEntries,
    product: lookup.product,
    price: submission.price,
    selectedStore: submission.selectedStore,
    setSelectedStore: submission.setSelectedStore,
    submitted: submission.submitted,
    saving: submission.saving,
    aiLoading: false as const,
    clubCardPrice: submission.clubCardPrice,
    setClubCardPrice: submission.setClubCardPrice,
    clubCardName: submission.clubCardName,
    setClubCardName: submission.setClubCardName,
    dealQuantity: submission.dealQuantity,
    dealTotal: submission.dealTotal,
    error: submission.error || lookup.error,
    loading: lookup.loading,
    // Handlers
    lookUpProduct,
    handleSubmitPrice: submission.handleSubmitPrice,
    handleConfirmPrice: actions.handleConfirmPrice,
    handleFlagPrice: actions.handleFlagPrice,
    handleScanPriceTag: () => {},
    handleAddToBasket: submission.handleAddToBasket,
    handlePriceChange: submission.handlePriceChange,
    resetScan,
    // Alert props — spread onto <AppAlert> in the consuming screen
    alertProps,
  };
}
