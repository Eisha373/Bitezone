import {dummyProducts} from "../../data/dummyProducts";
import {ProductCard} from "../../components/ProductCard";

const Home = () => {
  return (
    <div className="home">
      <h1>Our Menu</h1>
      <div className="product-grid">
        {dummyProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Home;