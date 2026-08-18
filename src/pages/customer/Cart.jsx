import { Link } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import "../../cart.css";

export function Cart() {
  const { cartItems, updateQuantity, totalPrice,removeFromCart } = useCart();

  const isCartEmpty = cartItems.length === 0;

  function handleIncrement(id, currentQuantity) {
    updateQuantity(id, currentQuantity + 1);
  }

  function handleDecrement(id, currentQuantity) {
  if (currentQuantity > 1) {
    updateQuantity(id, currentQuantity - 1);
  } else {
    removeFromCart(id);
  }
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
                <div className="cart-item" key={item._id}>
                  <img src={item.imageLink} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p>Price: Rs {item.price}</p>
                  </div>
                  <div className="quantity-control">
                    <button className="qty-btn" onClick={() => handleDecrement(item._id, item.quantity)}>-</button>
                    <span className="qty-count">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => handleIncrement(item._id, item.quantity)}>+</button>
                  </div>
                  <p className="cart-item-subtotal">Rs {item.price * item.quantity}</p>
                <button className="remove-btn" onClick={() => removeFromCart(item._id)} aria-label="Remove item">
      Remove
    </button>
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