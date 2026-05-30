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

export type PriceEntry = {
  id: number;
  store_name: string;
  price: number;
  created_at: string;
  confirms: number;
  flags: number;
  club_card_price?: number | null;
  club_card_name?: string | null;
  deal?: string | null;
  deal_price?: number | null;
};

export type Product = {
  barcode: string;
  product_name?: string;
  image_url?: string | null;
  brands?: string;
  quantity?: string;
};

export type PriceSubmission = {
  barcode: string;
  product_name: string;
  store_name: string;
  price: number;
  club_card_price?: number | null;
  club_card_name?: string | null;
  deal?: string | null;
  deal_price?: number | null;
};

export type AiPriceResult = {
  single_price: number;
  deal: string | null;
  deal_price_per_item: number | null;
  has_deal: boolean;
};
