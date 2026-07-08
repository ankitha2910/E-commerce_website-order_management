import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // Load from local storage initially
    const savedCart = localStorage.getItem('novaboard_cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        supabase.from('profiles').select('cart').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data && data.cart && Array.isArray(data.cart) && data.cart.length > 0) {
               setCart(data.cart);
            }
          });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  // Save to local storage whenever cart changes
  useEffect(() => {
    localStorage.setItem('novaboard_cart', JSON.stringify(cart));
  }, [cart]);

  const syncCartToDB = (newCart) => {
    if (userId) {
      supabase.from('profiles').update({ cart: newCart }).eq('id', userId).then();
    }
  };

  const addToCart = (product) => {
    const exists = cart.find((item) => item.id === product.id);
    let newCart;
    if (exists) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, qty: 1 }];
    }
    setCart(newCart);
    syncCartToDB(newCart);
  };

  const updateQty = (id, amount) => {
    const newCart = cart.map((item) => {
      if (item.id === id) {
        const newQty = item.qty + amount;
        return { ...item, qty: Math.max(0, newQty) };
      }
      return item;
    }).filter((item) => item.qty > 0);
    
    setCart(newCart);
    syncCartToDB(newCart);
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter((item) => item.id !== id);
    setCart(newCart);
    syncCartToDB(newCart);
  };

  const clearCart = () => {
    setCart([]);
    // Optionally sync clear to DB if it was intentional by user checkout
    syncCartToDB([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.qty, 0);

  const value = {
    cart,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
