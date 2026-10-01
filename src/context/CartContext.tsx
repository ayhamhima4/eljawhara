import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product } from '../types/store';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  notification: string | null;
  setNotification: (msg: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('baking_store_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('baking_store_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  const addToCart = (product: Product, quantity = 1): boolean => {
    if (product.stock <= 0) {
      showNotification(`عذراً، منتج "${product.name}" نفد من المخزون حالياً`);
      return false;
    }

    let success = true;
    setItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const currentQty = prev[existingIdx].quantity;
        const newQty = currentQty + quantity;
        if (newQty > product.stock) {
          showNotification(`الحد الأقصى المتوفر في المخزن هو ${product.stock} قطعة فقط`);
          success = false;
          return prev;
        }
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        showNotification(`تم زيادة الكمية إلى ${newQty} بنجاح`);
        return updated;
      } else {
        if (quantity > product.stock) {
          showNotification(`الكمية المتاحة حالياً هي ${product.stock} قطعة فقط`);
          success = false;
          return prev;
        }
        showNotification(`تمت إضافة "${product.name}" إلى السلة`);
        return [...prev, { product, quantity }];
      }
    });

    return success;
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
    showNotification('تمت إزالة المنتج من السلة');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          if (quantity > item.product.stock) {
            showNotification(`المخزون المتوفر هو ${item.product.stock} قطعة فقط`);
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscountPercent(0);
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'CHEF10') {
      setAppliedCoupon('CHEF10');
      setDiscountPercent(10);
      return { success: true, message: 'تم تطبيق كود خصم الشيف بنسبة 10%!' };
    }
    if (clean === 'BAKER20') {
      setAppliedCoupon('BAKER20');
      setDiscountPercent(20);
      return { success: true, message: 'تم تطبيق كود خصم الخبازين 20%!' };
    }
    return { success: false, message: 'كوبون الخصم غير صالح أو منتهي الصلاحية' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(0);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  // Free delivery over 300 DZD, standard 40 DZD
  const shippingFee = subtotal > 300 || subtotal === 0 ? 0 : 40;
  const discount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal + shippingFee - discount);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotal,
        shippingFee,
        discount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        total,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        notification,
        setNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
