import { useState, useEffect } from "react";
import { ProductCard } from "../../components/ProductCard";
import { AppNavbar } from "../../components/AppNavbar";
import { Footer } from "../../components/Footer";
import "../../home.css";

const CATEGORY_LABELS = {
  pizza: "Pizza",
  burger: "Burgers",
  nuggets: "Nuggets",
  sandwich: "Sandwiches",
  fries: "Fries",
  pasta: "Pasta",
  shawarma:"Shawarma",
  desert:"Desert",
  refreshment:"Refreshment",
};

const CATEGORY_ORDER = ["burger", "pizza", "sandwich", "nuggets", "fries", "pasta"];


export function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

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

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // categories that actually have at least one product, for building the pill list
  const availableCategories = CATEGORY_ORDER.filter((catKey) =>
    products.some((p) => p.category === catKey)
  );

  const groupedByCategory = CATEGORY_ORDER.map((catKey) => ({
    key: catKey,
    label: CATEGORY_LABELS[catKey],
    items: filteredProducts.filter((p) => p.category === catKey),
  })).filter((group) => group.items.length > 0);

  return (
  <div className="page-wrapper">
    <AppNavbar />

    <div className={`home-container ${isAdmin ? "theme-admin" : "theme-customer"}`}>
      <h1>Menu</h1>

      <input
        type="text"
        className="menu-search-bar"
        placeholder="Search for your favourite items here"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="category-pills">
        <button
          className={`category-pill ${activeCategory === "all" ? "category-pill-active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          All
        </button>
        {availableCategories.map((catKey) => (
          <button
            key={catKey}
            className={`category-pill ${activeCategory === catKey ? "category-pill-active" : ""}`}
            onClick={() => setActiveCategory(catKey)}
          >
            {CATEGORY_LABELS[catKey]}
          </button>
        ))}
      </div>
      
        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading ? (
          <div className="page-loader">
            <p>Loading...</p>
          </div>
        ) : groupedByCategory.length === 0 ? (
          <p className="no-results">No items match "{searchTerm}"</p>
        ) : (
          groupedByCategory.map((group) => (
            <section key={group.key} className="menu-category-section">
              <h2 className="menu-category-title">{group.label}</h2>
              <div className="product-grid">
                {group.items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
}