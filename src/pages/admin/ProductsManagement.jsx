import { useState, useEffect } from "react";
import { AppNavbar } from "../../components/AppNavbar";
import { Footer } from "../../components/Footer";
import "../../admin.css";

const CATEGORIES = [
  "pizza",
  "burger",
  "sandwich",
  "fries",
  "pasta",
  "nuggets",
  "shawarma",
];

export function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
const [imagePickerOpen, setImagePickerOpen] = useState(false);
const [imagePickerMode, setImagePickerMode] = useState("");
   const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    imageLink: "",
    category: "burger"});

  // Load products when component opens
  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load products");
      }

      setProducts(data);
    } catch (error) {
      setError(error.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // HANDLE NORMAL FORM INPUTS
  // =========================================================

  function handleFormChange(e) {
  setForm((prev) => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
}

function handleImageChange(e) {
  const file = e.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setError("Please select a valid image file.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    setError("Image size must be less than 2 MB.");
    return;
  }

  setError("");

  const reader = new FileReader();

  reader.onloadend = () => {
    const imageData = reader.result;

    setForm((prev) => ({
      ...prev,
      imageLink: imageData,
    }));

    setImagePreview(imageData);
  };

  reader.readAsDataURL(file);
}

  // =========================================================
  // RESET FORM
  // =========================================================

  function resetForm() {
    setForm({
      name: "",
      price: "",
      description: "",
      imageLink: "",
      category: "burger",
    });

    setImagePreview("");
    setEditingId(null);
    setError("");

    // Reset file input
    const fileInput = document.getElementById("imageFile");

    if (fileInput) {
      fileInput.value = "";
    }
  }

  // =========================================================
  // ADD / UPDATE PRODUCT
  // =========================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    // Validate image
    if (!form.imageLink) {
      setError("Please provide an image URL or browse for an image.");
      return;
    }

    // Validate name
    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    // Validate price
    if (form.price === "" || Number(form.price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

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
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to save product");
        return;
      }

      // Reset form
      resetForm();

      // Reload products
      await fetchProducts();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  // =========================================================
  // EDIT PRODUCT
  // =========================================================

  function handleEditClick(product) {
    setEditingId(product._id);

    setForm({
      name: product.name || "",
      price: product.price ?? "",
      description: product.description || "",
      imageLink: product.imageLink || "",
      category: product.category || "burger",
    });

    // Show existing image
    setImagePreview(product.imageLink || "");
     setError("");

    // Scroll to top/form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================================================
  // DELETE PRODUCT - OPEN CONFIRMATION
  // =========================================================

  function handleDeleteClick(id) {
    setDeleteTargetId(id);
    setError("");
  }

  async function confirmDelete() {
    if (!deleteTargetId) {
      return;
    }

    try {
      setError("");
  const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${deleteTargetId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Failed to delete product");
        return;
      }

      // Close confirmation
      setDeleteTargetId(null);

      // Reload products
      await fetchProducts();
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
        {error && ( <p style={{color: "red",marginBottom: "15px",fontWeight: "500", }}>{error}
          </p>
        )}

        {loading ? (
          <div className="page-loader">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <form className="product-form" onSubmit={handleSubmit}>
              <h2>
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>

              {/* Product Name */}
              <label htmlFor="name">
                Product Name:
              </label>

              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter Product name"
                value={form.name}
                onChange={handleFormChange}
                required
              />

              {/* Price */}
              <label htmlFor="price">
                Price:
              </label>

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

              <label className="image-field-label">
  Product Image:
</label>

<div className="image-picker">

  {/* Main button */}
  <button
    type="button"
    className="image-picker-main"
    onClick={() =>
      setImagePickerOpen((prev) => !prev)
    }
  >
    <span>
      🖼️
      {imagePreview ? " Change Product Image" : " Add Product Image"}
    </span>

    <span className="image-picker-arrow">
      {imagePickerOpen ? "▲" : "▼"}
    </span>
  </button>


  {/* Dropdown options */}
  {imagePickerOpen && (
    <div className="image-picker-menu">

      {/* URL option */}
      <button
        type="button"
        className="image-picker-option"
        onClick={() => {
          setImagePickerMode("url");
          setImagePickerOpen(false);
        }}
      >
        <span className="image-option-icon">🔗</span>

        <span>
          <strong>Insert Image URL</strong>
          <small>Paste an image link</small>
        </span>
      </button>


      {/* Browse option */}
      <button
        type="button"
        className="image-picker-option"
        onClick={() => {
          setImagePickerOpen(false);
          document.getElementById("imageFile").click();
        }}
      >
        <span className="image-option-icon">📎</span>

        <span>
          <strong>Browse Image</strong>
          <small>Browse an image</small>
        </span>
      </button>

    </div>
  )}

</div>

{/* URL input appears only when URL option is selected */}
{imagePickerMode === "url" && (
  <div className="image-url-input">
    <input
      type="text"
      placeholder="Paste Image URL"
      value={form.imageLink.startsWith("data:image") ? "" : form.imageLink}
      onChange={(e) => {
        setForm((prev) => ({
          ...prev,
          imageLink: e.target.value,
        }));

        setImagePreview(e.target.value);
        setError("");
      }}
    />
  </div>
)}


{/* Hidden file input */}
<input
  type="file"
  id="imageFile"
  accept="image/*"
  onChange={handleImageChange}
  className="hidden-file-input"
/>


{/* Preview */}
{imagePreview && (
  <div className="image-preview-container">

    <p>Image Preview:</p>

    <img
      src={imagePreview}
      alt="Product Preview"
      className="image-preview"
    />

  </div>
)}
              {/* Description */}
              <label htmlFor="description">
                Description: (optional)
              </label>

              <input
                type="text"
                id="description"
                name="description"
                placeholder="Enter Product Description"
                value={form.description}
                onChange={handleFormChange}
              />

              {/* Category */}
              <label htmlFor="category">
                Category:
              </label>

              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleFormChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Buttons */}
              <div className="product-form-actions">
                <button type="submit">
                  {editingId
                    ? "Update Product"
                    : "Add Product"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* =================================================
                PRODUCTS GRID
            ================================================= */}

            <div className="admin-products-grid">
              {products.length === 0 ? (
                <p className="empty-state">
                  No products yet. Add your first product
                  using the form above.
                </p>
              ) : (
                products.map((product) => (
                  <div
                    className="admin-product-card"
                    key={product._id}
                  >
                    {/* Product Image */}
                    <img
                      src={product.imageLink}
                      alt={product.name}
                      className="admin-product-image"
                    />

                    {/* Product Name */}
                    <h3>{product.name}</h3>

                    {/* Product Price + Category */}
                    <p>
                      Rs {product.price} ·{" "}
                      {product.category}
                    </p>

                    {/* Actions */}
                    <div className="admin-product-actions">
                      <button
                        type="button"
                        onClick={() =>
                          handleEditClick(product)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteClick(product._id)
                        }
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deleteTargetId && (
        <div className="confirm-overlay">
          <div className="confirm-card">
            <p>
              Are you sure you want to delete this product?
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                onClick={cancelDelete}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="confirm-delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}