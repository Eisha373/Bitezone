import { createContext, useState, useContext } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  function addToCart(product, quantity) {
    const existingItem = cartItems.find((item) => item._id === product._id);

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity }]);
    }
  }

  function removeFromCart(productId) {
    setCartItems(cartItems.filter((item) => item._id !== productId));
  }

  function updateQuantity(productId, newQuantity) {
    setCartItems(
      cartItems.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}