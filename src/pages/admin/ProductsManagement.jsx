import { useState, useEffect } from "react";
import { AppNavbar } from "../../components/AppNavbar";
import { Footer } from "../../components/Footer";
import "../../admin.css";

const CATEGORIES = ["pizza", "burger", "sandwich", "fries", "pasta", "nuggets","shawarma"];

export function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    imageLink: "",
    category: "burger",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      const data = await response.json();
      setProducts(data);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm({ name: "", price: "", description: "", imageLink: "", category: "burger" });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");

    const url = editingId
      ? `${import.meta.env.VITE_API_URL}/api/products/${editingId}`
      : `${import.meta.env.VITE_API_URL}/api/products`;
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to save product");
        return;
      }

      resetForm();
      fetchProducts();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  function handleEditClick(product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description || "",
      imageLink: product.imageLink,
      category: product.category,
    });
  }

  function handleDeleteClick(id) {
  setDeleteTargetId(id);
}

async function confirmDelete() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${deleteTargetId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      setError("Failed to delete product");
      return;
    }

    setDeleteTargetId(null);
    fetchProducts();
  } catch {
    setError("Something went wrong. Please try again.");
  }
}

function cancelDelete() {
  setDeleteTargetId(null);
}
      return (
        
    <div className="page-wrapper">
    <AppNavbar />

      <div className="admin-container">
        <h1>Manage Products</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {loading ? (
          <div className="page-loader">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <form className="product-form" onSubmit={handleSubmit}>
              <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>

              <label htmlFor="name">Product Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter Product name"
                value={form.name}
                onChange={handleFormChange}
                required
              />

              <label htmlFor="price">Price:</label>
              <input
                type="number"
                id="price"
                name="price"
                placeholder="Enter Product Price"
                value={form.price}
                onChange={handleFormChange}
                min="0"
                required
              />

              <label htmlFor="imageLink">Image URL:</label>
              <input
                type="text"
                id="imageLink"
                name="imageLink"
                placeholder="Insert Image URL"
                value={form.imageLink}
                onChange={handleFormChange}
                required
              />

              <label htmlFor="description">Description:(optional)</label>
              <input
                type="text"
                id="description"
                name="description"
                placeholder="Enter Product Description"
                value={form.description}
                onChange={handleFormChange}
              />

              <label htmlFor="category">Category:</label>
              <select id="category" name="category" value={form.category} onChange={handleFormChange}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <div className="product-form-actions">
                <button type="submit">{editingId ? "Update Product" : "Add Product"}</button>
                {editingId && (
                  <button type="button" onClick={resetForm}>Cancel</button>
                )}
              </div>
            </form>

            <div className="admin-products-grid">
              {products.length === 0 ? (
                <p className="empty-state">No products yet. Add your first product using the form above.</p>
              ) : (
                products.map((product) => (
                  <div className="admin-product-card" key={product._id}>
                    <img src={product.imageLink} alt={product.name} className="admin-product-image" />
                    <h3>{product.name}</h3>
                    <p>Rs {product.price} · {product.category}</p>
                    <div className="admin-product-actions">
                      <button onClick={() => handleEditClick(product)}>Edit</button>
<button onClick={() => handleDeleteClick(product._id)} className="delete-btn">Delete</button>                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
      {deleteTargetId && (
  <div className="confirm-overlay">
    <div className="confirm-card">
      <p>Are you sure you want to delete this product?</p>
      <div className="confirm-actions">
        <button onClick={cancelDelete}>Cancel</button>
        <button onClick={confirmDelete} className="confirm-delete-btn">Delete</button>
      </div>
    </div>
  </div>
)}

      <Footer />
    </div>
  );
}