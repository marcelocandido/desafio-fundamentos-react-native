import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsCart = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (productsCart) setProducts(JSON.parse(productsCart));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productsCart = [...products];

      const productExistIndex = products.findIndex(
        item => item.id === product.id,
      );

      if (productExistIndex !== -1) {
        productsCart[productExistIndex].quantity += 1;
      } else {
        productsCart.push({ ...product, quantity: 1 });
      }

      setProducts(productsCart);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(productsCart),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsCart = [...products];

      const productExistIndex = products.findIndex(item => item.id === id);

      if (productExistIndex !== -1) {
        productsCart[productExistIndex].quantity += 1;
      }

      setProducts(productsCart);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(productsCart),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsCart = [...products];

      const productExistIndex = products.findIndex(item => item.id === id);

      if (productExistIndex !== -1) {
        productsCart[productExistIndex].quantity -= 1;
      }

      setProducts(productsCart);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(productsCart),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
