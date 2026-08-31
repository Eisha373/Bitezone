import { useCart } from "../context/CartContext";
import { useState } from "react";

export function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  function handleIncrement() {
    setQuantity(quantity + 1);
  }
  function handleDecrement() {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }

  function handleAddToCart() {
    addToCart(product, quantity);
    setQuantity(1);
  }

  return (
    <div className="product-card">
      <img src={product.imageLink} alt={product.name} className="product-image" />
      <h3>{product.name}</h3>

      {product.description && (
        <p className="product-description">{product.description}</p>
      )}

      <p className="product-price">Price: Rs {product.price}</p>

      <div className="quantity-control">
        <button className="qty-btn" onClick={handleDecrement}>-</button>
        <span className="qty-count">{quantity}</span>
        <button className="qty-btn" onClick={handleIncrement}>+</button>
      </div>
      <div className="product-action">
        <button className={isAdmin ? "add-to-cart-btn-admin" : "add-to-cart-btn"} onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}