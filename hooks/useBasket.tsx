import { createContext, ReactNode, useContext, useState } from 'react';

export type BasketItem = {
  barcode: string;
  product_name: string;
  image_url: string | null;
  store_name: string;
  price: number;
  quantity: number;
  dealTotal?: number; // exact total when part of a deal
};

type BasketContextType = {
  basket: BasketItem[];
  addItem: (item: Omit<BasketItem, 'quantity'>) => void;
  removeItem: (barcode: string, store_name: string) => void;
  updateQuantity: (barcode: string, store_name: string, quantity: number) => void;
  clearBasket: () => void;
  total: number;
  itemCount: number;
};

const BasketContext = createContext<BasketContextType | null>(null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [basket, setBasket] = useState<BasketItem[]>([]);

  const addItem = (item: Omit<BasketItem, 'quantity'> & { quantity?: number }) => {
    setBasket(prev => {
      const existing = prev.find(
        i => i.barcode === item.barcode && i.store_name === item.store_name
      );
      if (existing) {
        return prev.map(i =>
          i.barcode === item.barcode && i.store_name === item.store_name
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeItem = (barcode: string, store_name: string) => {
    setBasket(prev =>
      prev.filter(i => !(i.barcode === barcode && i.store_name === store_name))
    );
  };

  const updateQuantity = (barcode: string, store_name: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(barcode, store_name);
      return;
    }
    setBasket(prev =>
      prev.map(i =>
        i.barcode === barcode && i.store_name === store_name
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearBasket = () => setBasket([]);

  const total = basket.reduce((sum, item) => {
    if (item.dealTotal) return sum + item.dealTotal;
    return sum + item.price * item.quantity;
  }, 0);

  const itemCount = basket.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <BasketContext.Provider value={{
      basket, addItem, removeItem, updateQuantity, clearBasket, total, itemCount
    }}>
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) throw new Error('useBasket must be used within a BasketProvider');
  return context;
}