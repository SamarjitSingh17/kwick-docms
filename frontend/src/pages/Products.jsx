/**
 * Admin Product Management Page
 *
 * Features
 *  • List all products (GET /api/products)
 *  • Add a new product via a modal form (POST /api/products)
 *  • Edit an existing product via a modal form (PUT /api/products/:id)
 *  • Delete a product (DELETE /api/products/:id)
 *
 * Styling – Tailwind CSS, dark‑mode friendly, glass‑morphism cards,
 *           smooth hover animations and a reusable modal component.
 *
 * Auth – Uses AppContext to obtain JWT token and include it in API calls.
 */

import React, { useEffect, useState, useContext } from "react";
import Loading from "../components/Loading";

import { Plus, SearchIcon, Pencil, Trash2, XIcon } from "lucide-react";
import { api } from "../api/axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Products = () => {
  // ---------- context ----------
  const { getAuthHeaders } = useContext(AppContext);

  // ---------- state ----------
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // modal visibility
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // selected product for edit
  const [selectedProduct, setSelectedProduct] = useState(null);

  // form states (separate for add & edit)
  const [newProduct, setNewProduct] = useState({ name: "", category: "", description: "" });
  const [editProduct, setEditProduct] = useState({ name: "", category: "", description: "" });

  // ---------- fetch all products ----------
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/products", { headers: getAuthHeaders() });
      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.message || "Failed to load products");
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ---------- handlers ----------
  const handleInput = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  // Add new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.category) return;
    try {
      const { data } = await api.post("/api/products", newProduct, { headers: getAuthHeaders() });
      if (data.success) {
        toast.success(data.message);
        setNewProduct({ name: "", category: "", description: "" });
        setShowCreateModal(false);
        await fetchProducts();
      } else {
        toast.error(data.message || "Failed to add product");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  // Edit existing product
  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!editProduct.name || !editProduct.category) return;
    try {
      const { data } = await api.put(`/api/products/${selectedProduct._id}`, editProduct, { headers: getAuthHeaders() });
      if (data.success) {
        toast.success(data.message);
        setShowEditModal(false);
        setSelectedProduct(null);
        await fetchProducts();
      } else {
        toast.error(data.message || "Failed to update product");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditProduct({ name: product.name, category: product.category, description: product.description || "" });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const { data } = await api.delete(`/api/products/${id}`, { headers: getAuthHeaders() });
      if (data.success) {
        toast.success(data.message);
        await fetchProducts();
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  // ---------- UI ----------
  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalog</p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setNewProduct({ name: "", category: "", description: "" });
          }}
          className="flex items-center justify-center w-full sm:w-auto gap-2 btn-primary hover:cursor-pointer"
        >
          <Plus />
          <p>Add Product</p>
        </button>
      </div>

      {/* Error message */}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto rounded-lg shadow-sm bg-white border border-gray-200">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600 border-b border-gray-200">Name</th>
              <th className="px-4 py-3 font-medium text-gray-600 border-b border-gray-200">Category</th>
              <th className="px-4 py-3 font-medium text-gray-600 border-b border-gray-200">Description</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600 border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50 even:bg-gray-50">
                <td className="px-4 py-3 font-medium text-slate-800 border-b border-gray-200 align-top">{p.name}</td>
                <td className="px-4 py-3 text-slate-800 border-b border-gray-200 align-top">{p.category}</td>
                <td className="px-4 py-3 text-slate-600 border-b border-gray-200 align-top">{p.description || "—"}</td>
                <td className="px-4 py-3 border-b border-gray-200 align-top">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-500 hover:border-indigo-200 transition-colors hover:cursor-pointer"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors hover:cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ----------- Add Product Modal ----------- */}
      {showCreateModal && (
        <div
          className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-start justify-center overflow-y-auto"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="fixed inset-0" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in"
          >
            <div className="flex items-center justify-between p-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Add New Product
                </h2>
                <p className="text-sm text-gray-500 mt-2">Create a product entry</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800"
              >
                <XIcon />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddProduct} className="max-w-3xl animate-fade-in">
                <div className="card p-5 sm:p-6">
                  <h3 className="font-medium mb-6 pb-5 border-b border-gray-200">Product Details</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block mb-2">Name</label>
                      <input
                        name="name"
                        type="text"
                        required
                        placeholder="Enter product name"
                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        value={newProduct.name}
                        onChange={(e) => handleInput(e, setNewProduct)}
                      />
                    </div>
                    {/* Category */}
                    <div>
                      <label className="block mb-2">Category</label>
                      <input
                        name="category"
                        type="text"
                        required
                        placeholder="Enter product category"
                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        value={newProduct.category}
                        onChange={(e) => handleInput(e, setNewProduct)}
                      />
                    </div>
                    {/* Description */}
                    <div>
                      <label className="block mb-2">Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        placeholder="Enter product description (optional)"
                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        value={newProduct.description}
                        onChange={(e) => handleInput(e, setNewProduct)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="mr-3 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ----------- Edit Product Modal ----------- */}
      {showEditModal && (
        <div
          className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-start justify-center overflow-y-auto"
          onClick={() => setShowEditModal(false)}
        >
          <div className="fixed inset-0" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in"
          >
            <div className="flex items-center justify-between p-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Edit Product
                </h2>
                <p className="text-sm text-gray-500 mt-2">Update your product details</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800"
              >
                <XIcon />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditProduct} className="max-w-3xl animate-fade-in">
                <div className="card p-5 sm:p-6">
                  <h3 className="font-medium mb-6 pb-5 border-b border-gray-200">Product Details</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-700 space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block mb-2">Name</label>
                      <input
                        name="name"
                        type="text"
                        required
                        placeholder="Enter product name"
                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        value={editProduct.name}
                        onChange={(e) => handleInput(e, setEditProduct)}
                      />
                    </div>
                    {/* Category */}
                    <div>
                      <label className="block mb-2">Category</label>
                      <input
                        name="category"
                        type="text"
                        required
                        placeholder="Enter product category"
                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        value={editProduct.category}
                        onChange={(e) => handleInput(e, setEditProduct)}
                      />
                    </div>
                    {/* Description */}
                    <div>
                      <label className="block mb-2">Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        placeholder="Enter product description (optional)"
                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        value={editProduct.description}
                        onChange={(e) => handleInput(e, setEditProduct)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="mr-3 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;