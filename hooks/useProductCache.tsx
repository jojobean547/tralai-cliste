import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';

const db = SQLite.openDatabaseSync('tralai.db');

export function useProductCache() {

  useEffect(() => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS products (
        barcode TEXT PRIMARY KEY,
        product_name TEXT,
        brands TEXT,
        quantity TEXT,
        image_url TEXT,
        cached_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS prices (
        id TEXT PRIMARY KEY,
        barcode TEXT,
        store_name TEXT,
        price REAL,
        created_at TEXT,
        cached_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS pending_submissions (
        id TEXT PRIMARY KEY,
        barcode TEXT,
        product_name TEXT,
        store_name TEXT,
        price REAL,
        deal TEXT,
        deal_price REAL,
        created_at INTEGER
      );
    `);

    // Schema v1: add deal columns to existing pending_submissions tables
    const { user_version } = db.getFirstSync<{ user_version: number }>('PRAGMA user_version') ?? { user_version: 0 };
    if (user_version < 1) {
      try { db.execSync('ALTER TABLE pending_submissions ADD COLUMN deal TEXT'); } catch {}
      try { db.execSync('ALTER TABLE pending_submissions ADD COLUMN deal_price REAL'); } catch {}
      db.execSync('PRAGMA user_version = 1');
    }
  }, []);

  const getCachedProduct = (barcode: string) => {
    try {
      const result = db.getFirstSync(
        'SELECT * FROM products WHERE barcode = ?',
        [barcode]
      );
      return result || null;
    } catch {
      return null;
    }
  };

  const cacheProduct = (barcode: string, product: any) => {
    try {
      db.runSync(
        `INSERT OR REPLACE INTO products 
         (barcode, product_name, brands, quantity, image_url, cached_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          barcode,
          product.product_name || '',
          product.brands || '',
          product.quantity || '',
          product.image_url || '',
          Date.now()
        ]
      );
    } catch (e) {
      console.log('Cache product error:', e);
    }
  };

  const getCachedPrices = (barcode: string) => {
    try {
      const results = db.getAllSync(
        'SELECT * FROM prices WHERE barcode = ? ORDER BY price ASC',
        [barcode]
      );
      return results || [];
    } catch {
      return [];
    }
  };

  const cachePrices = (barcode: string, prices: any[]) => {
    try {
      prices.forEach(price => {
        db.runSync(
          `INSERT OR REPLACE INTO prices 
           (id, barcode, store_name, price, created_at, cached_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            String(price.id),
            barcode,
            price.store_name,
            price.price,
            price.created_at,
            Date.now()
          ]
        );
      });
    } catch (e) {
      console.log('Cache prices error:', e);
    }
  };

  const addPendingSubmission = (submission: {
    barcode: string;
    product_name: string;
    store_name: string;
    price: number;
    deal?: string | null;
    deal_price?: number | null;
  }) => {
    try {
      db.runSync(
        `INSERT INTO pending_submissions
         (id, barcode, product_name, store_name, price, deal, deal_price, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9),
          submission.barcode,
          submission.product_name,
          submission.store_name,
          submission.price,
          submission.deal ?? null,
          submission.deal_price ?? null,
          Date.now()
        ]
      );
    } catch (e) {
      console.log('Pending submission error:', e);
    }
  };

  const getPendingSubmissions = () => {
    try {
      return db.getAllSync('SELECT * FROM pending_submissions') || [];
    } catch {
      return [];
    }
  };

  const removePendingSubmission = (id: string) => {
    try {
      db.runSync('DELETE FROM pending_submissions WHERE id = ?', [id]);
    } catch (e) {
      console.log('Remove pending error:', e);
    }
  };

  return {
    getCachedProduct,
    cacheProduct,
    getCachedPrices,
    cachePrices,
    addPendingSubmission,
    getPendingSubmissions,
    removePendingSubmission,
  };
}