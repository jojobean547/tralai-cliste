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

import { AiPriceResult } from '@/types/index';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';
const API_URL = 'https://api.anthropic.com/v1/messages';
const TIMEOUT_MS = 15_000;

const PROMPT = `You are scanning an Irish supermarket shelf price label. Extract the pricing information and respond in this exact JSON format:

{
  "single_price": 1.99,
  "deal": "3 for €5.00",
  "deal_price_per_item": 1.67,
  "has_deal": true
}

Rules:
- single_price: the normal price for one item (required, number only, no currency symbol)
- deal: the deal text exactly as shown e.g. "3 for €5", "Buy 2 get 1 free", "2 for €3" (null if no deal)
- deal_price_per_item: price per item if deal is taken up (null if no deal or cannot calculate)
- has_deal: true if there is a multi-buy deal, false if not
- If you cannot find any price at all, respond with: NONE
- Respond with JSON only, no other text`;

export async function scanPriceTag(base64Image: string): Promise<AiPriceResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data: base64Image },
              },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
      }),
    });
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new Error('Price tag scan timed out. Please try again.');
    }
    throw new Error('Could not reach the AI service. Check your internet connection.');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`AI service error (${response.status}). Please try again.`);
  }

  const data = await response.json();
  const raw: string = data?.content?.[0]?.text?.trim() ?? '';

  if (!raw) {
    throw new Error('No response from AI. Please try again.');
  }

  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  if (!cleaned || cleaned === 'NONE') {
    throw new Error('No price detected in this image. Try again or enter the price manually.');
  }

  try {
    return JSON.parse(cleaned) as AiPriceResult;
  } catch {
    throw new Error('Could not read price tag. Try again or enter the price manually.');
  }
}

export function extractDealInfo(
  dealText: string,
  dealPricePerItem: number,
  singlePrice: number
): { quantity: number; totalPrice: number } {
  if (!dealText) return { quantity: 1, totalPrice: singlePrice };

  // "3 for 2" — buy 3 pay for 2 (no currency symbol means payQty is an item count)
  const forMatch = dealText.match(/(\d+)\s+for\s+(\d+)$/i);
  if (forMatch) {
    const buyQty = parseInt(forMatch[1]);
    const payQty = parseInt(forMatch[2]);
    if (payQty < 10 && !dealText.includes('€') && !dealText.includes('£') && !dealText.includes('$')) {
      return { quantity: buyQty, totalPrice: payQty * singlePrice };
    }
    return { quantity: buyQty, totalPrice: payQty };
  }

  // "3 for €5.00"
  const priceMatch = dealText.match(/(\d+)\s+for\s+[€£$]?\s*(\d+\.?\d*)/i);
  if (priceMatch) {
    return {
      quantity: parseInt(priceMatch[1]),
      totalPrice: parseFloat(priceMatch[2]),
    };
  }

  // "Buy 2 get 1 free" — 3 items, pay for 2
  const buyGetMatch = dealText.match(/buy\s+(\d+)\s+get\s+(\d+)/i);
  if (buyGetMatch) {
    const paying = parseInt(buyGetMatch[1]);
    const free = parseInt(buyGetMatch[2]);
    return { quantity: paying + free, totalPrice: dealPricePerItem * paying };
  }

  return { quantity: 1, totalPrice: singlePrice };
}
