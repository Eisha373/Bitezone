export function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <h3>{product.name}</h3>
      <p>Price: ${product.price}</p>
      <button className="add-to-cart-button">Add to Cart</button>
    </div>
  );
}