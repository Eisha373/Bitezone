import {useState} from "react";
export function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  function handleIncrement(){
    setQuantity(quantity+1);
  }
  function handleDecrement(){
    if(quantity>1){
      setQuantity(quantity-1);
    }
  }

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <h3>{product.name}</h3>
     <p className="product-price">Price: Rs {product.price}</p>

      <div className="quantity-control">
        <button className="qty-btn" onClick={handleDecrement}>-</button>
        <span className="qty-count">{quantity}</span>
        <button className="qty-btn" onClick={handleIncrement}>+</button>
      </div>
      <div className="product-action">
        <button className="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  );
}