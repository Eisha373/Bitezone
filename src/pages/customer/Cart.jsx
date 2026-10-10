import { Link, useNavigate } from "react-router-dom";
import "../../order.css";
import { Footer } from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import { AppNavbar } from "../../components/AppNavbar";
import "../../cart.css";

export function Cart() {

  const navigate = useNavigate();
  const { cartItems, updateQuantity, totalPrice,removeFromCart } = useCart();

  const isCartEmpty = cartItems.length === 0;

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  function handleIncrement(id, currentQuantity) {
    updateQuantity(id, currentQuantity + 1);
  }

  function handleDecrement(id, currentQuantity) {
  if (currentQuantity > 1) {
    updateQuantity(id, currentQuantity - 1);
  } 
}

  return (
    <div>
      <AppNavbar />

      <div className="cart-container">
        <h1>Your Cart</h1>

        {isCartEmpty ? (

<div className="empty-orders">
  <div className="empty-orders-icon">🛒</div>
  <h3>Your cart is empty</h3>
  <p>Looks like you haven't added anything yet.</p>
  <button className="empty-orders-cta" onClick={() => navigate("/menu")}>
    Browse Menu
  </button>
</div>) : (
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
                <button className={isAdmin ?"admin-remove-btn":"remove-btn"} onClick={() => removeFromCart(item._id)} aria-label="Remove item">
      Remove
    </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Total: Rs {totalPrice}</h2>
              <Link to="/checkout">
                <button className={isAdmin ?"admin-checkout-btn":"checkout-btn"}>Proceed to Checkout</button>
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}