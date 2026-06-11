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

import { useCallback, useState } from 'react';

type ScanScreenPricesParams = {
  selectedStore: string;
  setSelectedStore: (store: string) => void;
  resetScan: () => void;
  handleSubmitPrice: () => void;
};

export function useScanScreen({
  selectedStore,
  setSelectedStore,
  resetScan,
  handleSubmitPrice,
}: ScanScreenPricesParams) {
  const [scanning, setScanning] = useState(false);
  const [storeValidationError, setStoreValidationError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleStoreSelect = useCallback((store: string) => {
    setSelectedStore(store);
    setStoreValidationError(null);
    setScanError(null);
  }, [setSelectedStore]);

  const handleClearStore = useCallback(() => {
    resetScan();
    setSelectedStore('');
    setStoreValidationError(null);
    setScanError(null);
  }, [resetScan, setSelectedStore]);

  const handleScanAttempt = useCallback(() => {
    if (!selectedStore) { setScanError('Please select a store to start scanning'); return; }
    setScanError(null);
    resetScan();
    setStoreValidationError(null);
    setScanning(true);
  }, [selectedStore, resetScan]);

  const handleSubmitWithStoreCheck = useCallback(() => {
    if (!selectedStore) { setStoreValidationError('Please select a store above'); return; }
    setStoreValidationError(null);
    handleSubmitPrice();
  }, [selectedStore, handleSubmitPrice]);

  const cancelScanning = useCallback(() => {
    setScanning(false);
  }, []);

  return {
    scanning,
    setScanning,
    storeValidationError,
    scanError,
    handleStoreSelect,
    handleClearStore,
    handleScanAttempt,
    handleSubmitWithStoreCheck,
    cancelScanning,
  };
}
