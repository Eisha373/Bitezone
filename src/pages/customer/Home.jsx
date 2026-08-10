import { dummyProducts } from "../../data/DummyProducts";
import { ProductCard } from "../../components/ProductCard";
import { Navbar } from "../../components/Navbar";
import {Footer} from "../../components/Footer";
import "../../home.css";

export function Home() {
  return (
    <div>
      <Navbar />

      <div className="home-container">
        <h1>Menu</h1>
        <div className="product-grid">
          {dummyProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}