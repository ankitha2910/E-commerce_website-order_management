import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState(null);

  const fetchCart = async (uid) => {
    if (!uid) {
      setCart([]);
      return;
    }
    
    // Fetch cart items and join with products table
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        products (*)
      `)
      .eq('user_id', uid);
      
    if (error) {
      console.error("Error fetching cart:", error);
      return;
    }

    if (data) {
      // Map back to expected format
      const formattedCart = data
        .filter(item => item.products) // ensure product still exists
        .map(item => ({
          ...item.products,
          cart_item_id: item.id,
          qty: item.quantity
        }));
      setCart(formattedCart);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        fetchCart(session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserId(session.user.id);
        if (event === 'SIGNED_IN') {
           fetchCart(session.user.id);
        }
      } else {
        setUserId(null);
        setCart([]); // Completely wipe cart from memory when logged out
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const addToCart = async (product) => {
    if (!userId) {
      alert("Please login to add to cart");
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      // Update DB
      const newQty = existingItem.qty + 1;
      await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('user_id', userId)
        .eq('product_id', product.id);
      
      // Update Local State optimistically
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, qty: newQty } : item
      ));
    } else {
      // Insert DB
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{ user_id: userId, product_id: product.id, quantity: 1 }])
        .select()
        .single();
        
      if (!error && data) {
        // Update Local State optimistically
        setCart([...cart, { ...product, qty: 1, cart_item_id: data.id }]);
      } else if (error) {
         console.error("Error adding to cart:", error);
         // If error, refresh from DB to be safe
         fetchCart(userId);
      }
    }
  };

  const updateQty = async (id, amount) => {
    if (!userId) return;

    const existingItem = cart.find((item) => item.id === id);
    if (!existingItem) return;

    const newQty = existingItem.qty + amount;

    if (newQty <= 0) {
      // Remove item
      await removeFromCart(id);
    } else {
      // Update DB
      await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('user_id', userId)
        .eq('product_id', id);
        
      // Update Local State optimistically
      setCart(cart.map(item => 
        item.id === id ? { ...item, qty: newQty } : item
      ));
    }
  };

  const removeFromCart = async (productId) => {
    if (!userId) return;

    // Delete from DB
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
      
    // Update Local State optimistically
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = async () => {
    if (!userId) return;

    // Delete all from DB
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    setCart([]);
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
