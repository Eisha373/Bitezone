import { Link } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { dummyCart } from "../../data/DummyCart";
import { useState } from "react";
import "../../cart.css";

export function Cart() {
  const [cartItems, setCartItems] = useState(dummyCart);

  const isCartEmpty = cartItems.length === 0;

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  function handleIncrement(id) {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function handleDecrement(id) {
    setCartItems(
      cartItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  }

  return (
    <div>
      <Navbar />

      <div className="cart-container">
        <h1>Your Cart</h1>

        {isCartEmpty ? (
          <p className="empty-state">Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.imageLink} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p>Price: Rs {item.price}</p>
                  </div>
                  <div className="quantity-control">
                    <button className="qty-btn" onClick={() => handleDecrement(item.id)}>-</button>
                    <span className="qty-count">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => handleIncrement(item.id)}>+</button>
                  </div>
                  <p className="cart-item-subtotal">Rs {item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Total: Rs {totalPrice}</h2>
              <Link to="/checkout">
                <button className="checkout-btn">Proceed to Checkout</button>
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}