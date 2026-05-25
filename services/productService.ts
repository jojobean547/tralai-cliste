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

import { Product } from '@/types/index';

const OFF_USER_AGENT = 'Tralai/1.0 (tralai.ie) - Irish grocery price comparison app';

export async function fetchProduct(barcode: string): Promise<Product | null> {
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
    { headers: { 'User-Agent': OFF_USER_AGENT } }
  );

  const text = await response.text();

  let data: { status: number; product: Omit<Product, 'barcode'> };
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }

  if (data.status !== 1) {
    return null;
  }

  return { ...data.product, barcode };
}
