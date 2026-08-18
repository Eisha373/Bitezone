import { useState, useEffect } from "react";
import { ProductCard } from "../../components/ProductCard";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import "../../home.css";

export function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load products");
          return;
        }

        setProducts(data);
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div>
      <Navbar />

      <div className="home-container">
        <h1>Menu</h1>

        {loading && <p>Loading menu...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}