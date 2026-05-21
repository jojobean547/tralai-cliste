import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';

const db = SQLite.openDatabaseSync('tralai.db');

export function useProductCache() {

  useEffect(() => {
    // Create tables if they don't exist
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
        created_at INTEGER
      );
    `);
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
  }) => {
    try {
      db.runSync(
        `INSERT INTO pending_submissions 
         (id, barcode, product_name, store_name, price, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          String(Date.now()),
          submission.barcode,
          submission.product_name,
          submission.store_name,
          submission.price,
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