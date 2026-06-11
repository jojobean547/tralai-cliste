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

import { supabase } from '@/services/supabase';
import { Product } from '@/types/index';

const OFF_USER_AGENT = 'TralaiCliste/1.0 (tralai.ie) - Irish grocery price comparison app';

const OFF_DATABASES = [
  'world.openfoodfacts.org',
  'world.openbeautyfacts.org',
  'world.openproductsfacts.org',
];

function toTitleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getBestProductName(product: any): string {
  const name =
    product.product_name_en ||
    product.product_name_en_gb ||
    product.product_name_en_ie ||
    product.product_name ||
    product.generic_name_en ||
    product.generic_name ||
    '';
  return toTitleCase(name);
}

// ─── 1. Supabase lookup ────────────────────────────────────────────────────

async function fetchProductFromSupabase( barcode: string ): Promise<{ product: Product; needsImage: boolean } | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('barcode, product_name, brands, package_size, package_unit, package_quantity, image_url, category')
      .eq('barcode', barcode)
      .single();

    if (error || !data) return null;

    return {
      product: {
        barcode: data.barcode,
        product_name: data.product_name,
        brands: data.brands ?? undefined,
        quantity: data.package_quantity && data.package_quantity > 1 && data.package_size && data.package_unit
          ? `${data.package_quantity} x ${data.package_size}${data.package_unit}`
          : data.package_size && data.package_unit
            ? `${data.package_size}${data.package_unit}`
            : undefined,
        image_url: data.image_url ?? null,
      },
      needsImage: !data.image_url,
    };
  } catch {
    return null;
  }
}

// ─── 2. Open databases cascade (OFF → OBF → OPF) ──────────────────────────

async function queryOpenDatabase(
  host: string,
  barcode: string
): Promise<{ product: Product; source: string } | null> {
  let response: Response;
  try {
    response = await fetch(
      `https://${host}/api/v0/product/${barcode}.json`,
      { headers: { 'User-Agent': OFF_USER_AGENT } }
    );
  } catch {
    return null;
  }

  const text = await response.text();
  let data: { status: number; product: Omit<Product, 'barcode'> };
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }

  if (data.status !== 1) return null;

  const sourceMap: Record<string, string> = {
    'world.openfoodfacts.org': 'openfoodfacts',
    'world.openbeautyfacts.org': 'openbeautyfacts',
    'world.openproductsfacts.org': 'openproductsfacts',
  };

  return {
    product: {
      ...data.product,
      barcode,
      product_name: getBestProductName(data.product),
    },
    source: sourceMap[host] ?? 'openfoodfacts',
  };
}

async function fetchProductFromOpenDatabases( barcode: string ): Promise<{ product: Product; source: string } | null> {
  for (const host of OFF_DATABASES) {
    const result = await queryOpenDatabase(host, barcode);
    if (result) return result;
  }
  return null;
}

// ─── 3. Orchestrator — Supabase first, open databases fallback ────────────

export async function fetchProduct( barcode: string ): Promise<{ product: Product; source: string } | null> {
  const supabaseResult = await fetchProductFromSupabase(barcode);

  if (supabaseResult) {
    // Product found in Supabase — if image is missing try open databases for enrichment only
    if (supabaseResult.needsImage) {
      const openResult = await fetchProductFromOpenDatabases(barcode);
      if (openResult?.product.image_url) {
        // Fill image into Supabase silently
        supabase
          .from('products')
          .update({ image_url: openResult.product.image_url, source: openResult.source })
          .eq('barcode', barcode)
          .then(() => {})
          .catch(() => {});

        // Return product with image attached
        return {
          product: { ...supabaseResult.product, image_url: openResult.product.image_url },
          source: 'supabase',
        };
      }
    }
    return { product: supabaseResult.product, source: 'supabase' };
  }

  // Not in Supabase at all — try open databases
  return fetchProductFromOpenDatabases(barcode);
}

// ─── 4. Add new product to Supabase catalogue ─────────────────────────────

export async function submitNewProduct(
  product: Pick<Product, 'barcode' | 'product_name' | 'brands' | 'quantity' | 'image_url'>,
  userId?: string,
  source: string = 'user'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Parse quantity string back to size + unit for storage e.g. "500ml" → 500, "ml"
    const qtyMatch = product.quantity?.match(/^(\d+(?:\.\d+)?)\s*(g|kg|ml|l)?$/i);
    const package_size = qtyMatch ? parseFloat(qtyMatch[1]) : null;
    const package_unit = qtyMatch?.[2]?.toLowerCase() ?? null;

    const { error } = await supabase
      .from('products')
      .upsert({
        barcode:          product.barcode,
        product_name:     product.product_name,
        brands:           product.brands ?? null,
        package_size,
        package_unit,
        image_url:        product.image_url ?? null,
        source:           'user',
        submitted_by:     userId ?? null,
      }, { onConflict: 'barcode', ignoreDuplicates: true });
    
    // If image_url is missing in Supabase, fill it in from Open databases
    if (product.image_url) {
      await supabase
        .from('products')
        .update({ image_url: product.image_url, source })
        .eq('barcode', product.barcode)
        .is('image_url', null);
    }

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// ─── 5. Upload product image to Supabase Storage ──────────────────────────

export async function uploadProductImage(
  barcode: string,
  imageUri: string
): Promise<string | null> {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const path = `products/${barcode}.jpg`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) return null;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    return data.publicUrl;
  } catch {
    return null;
  }
}
