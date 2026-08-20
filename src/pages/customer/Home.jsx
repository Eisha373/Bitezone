import { useState, useEffect } from "react";
import { ProductCard } from "../../components/ProductCard";
import { AppNavbar } from "../../components/AppNavbar";
import { Footer } from "../../components/Footer";
import "../../home.css";

export function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load products");
          return;
        }

        setProducts(data);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div>
      <AppNavbar />

      <div className="home-container">
        <h1>Menu</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading ? (
          <div className="page-loader">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}