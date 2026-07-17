import React, { useEffect, useState, useContext } from "react";
import Loading from "../components/Loading";
import { SearchIcon, FileText, Eye, ArrowLeft, Tag, BookOpen, ChevronRight, Download } from "lucide-react";
import { api } from "../api/axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const ProductDocument = () => {
  // ---------- context ----------
  const { getAuthHeaders } = useContext(AppContext);

  // ---------- state ----------
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);
  const [error, setError] = useState("");

  // Search & Filter for products (left pane)
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Search for documents (right pane)
  const [docSearch, setDocSearch] = useState("");

  // Responsive state: 'list' (shows product list) or 'details' (shows document list) on mobile
  const [mobileView, setMobileView] = useState("list");

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

  // ---------- fetch documents when product is selected ----------
  const fetchDocumentsForProduct = async (productId) => {
    try {
      setDocsLoading(true);
      const { data } = await api.get(`/api/documents?productId=${productId}`, {
        headers: getAuthHeaders(),
      });
      if (data.success) {
        setDocuments(data.documents);
      } else {
        toast.error("Failed to load documents for this product");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleProductSelect = async (product) => {
    setSelectedProduct(product);
    setDocSearch("");
    setMobileView("details");
    await fetchDocumentsForProduct(product._id);
  };

  // ---------- helpers ----------
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getDocTypeLabel = (type) => {
    switch (type) {
      case "brochure":
        return "Brochure";
      case "specification":
        return "Technical Spec";
      case "manual":
        return "User Manual";
      case "presentation":
        return "Presentation";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  const handleView = (doc) => {
    const fileUrl = `${api.defaults.baseURL}/api/documents/${doc._id}/view`;
    window.open(fileUrl, "_blank");
  };

  const handleDownload = (doc) => {
    const fileUrl = `${api.defaults.baseURL}/api/documents/${doc._id}/download`;
    window.open(fileUrl, "_blank");
  };

  // ---------- filtering ----------
  // Unique categories for filtering
  const categories = [...new Set(products.map((p) => p.category))].filter(Boolean);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(docSearch.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="page-title">Product Resources</h1>
        <p className="page-subtitle">Browse products and download the latest sales collateral</p>
      </div>

      {error && <p className="text-center text-red-500 mb-4">{error}</p>}

      {/* Two-Pane Responsive Layout */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch min-h-[500px]">
        {/* Left Pane: Product Catalog */}
        <div
          className={`w-full md:w-80 md:flex flex-col gap-4 border-r border-slate-200 pr-0 md:pr-6 shrink-0 ${
            mobileView === "details" ? "hidden" : "flex"
          }`}
        >
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 tracking-wide uppercase">Products Directory</h2>
            
            {/* Search */}
            <div className="relative">
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-9 w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product List */}
          <div className="overflow-y-auto max-h-[450px] space-y-2 mt-2 pr-1">
            {filteredProducts.map((p) => {
              const isSelected = selectedProduct?._id === p._id;
              return (
                <button
                  key={p._id}
                  onClick={() => handleProductSelect(p)}
                  className={`w-full text-left p-3 rounded-xl border transition-all hover:cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? "bg-indigo-500/10 border-indigo-200 text-indigo-900"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <h3 className={`text-sm font-semibold truncate ${isSelected ? "text-indigo-950" : "text-slate-800"}`}>
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-500 truncate">{p.category}</span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? "text-indigo-600 translate-x-0.5" : "text-slate-400 group-hover:translate-x-0.5"
                    }`}
                  />
                </button>
              );
            })}
            {filteredProducts.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-6">No products found.</p>
            )}
          </div>
        </div>

        {/* Right Pane: Selected Product's Documents */}
        <div
          className={`flex-1 flex-col ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Back Button for mobile */}
          {mobileView === "details" && (
            <button
              onClick={() => setMobileView("list")}
              className="md:hidden flex items-center gap-2 text-indigo-600 font-semibold mb-4 text-sm hover:cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Products</span>
            </button>
          )}

          {selectedProduct ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex-1 flex flex-col shadow-xs">
              {/* Product Info Banner */}
              <div className="border-b border-slate-100 pb-5 mb-5">
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    {selectedProduct.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{selectedProduct.name}</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {selectedProduct.description || "No description provided for this product."}
                </p>
              </div>

              {/* Documents Search */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-sm font-semibold text-slate-800 tracking-wider uppercase flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Approved Documents</span>
                </h3>
                <div className="relative w-48 sm:w-64">
                  <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    className="pl-8 w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-xs py-1.5"
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Documents Table */}
              <div className="overflow-x-auto flex-1 min-h-[300px]">
                {docsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-indigo-600 gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="text-xs font-medium text-slate-500">Loading resources...</span>
                  </div>
                ) : (
                  <table className="w-full border border-slate-100 rounded-lg overflow-hidden border-collapse text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold text-left text-slate-700 border-b border-slate-100">Document Title</th>
                        <th className="px-4 py-2.5 font-semibold text-left text-slate-700 border-b border-slate-100">Type</th>
                        <th className="px-4 py-2.5 font-semibold text-center text-slate-700 border-b border-slate-100">Version</th>
                        <th className="px-4 py-2.5 font-semibold text-center text-slate-700 border-b border-slate-100">Format</th>
                        <th className="px-4 py-2.5 font-semibold text-right text-slate-700 border-b border-slate-100">Size</th>
                        <th className="px-4 py-2.5 font-semibold text-center text-slate-700 border-b border-slate-100">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc) => (
                        <tr key={doc._id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-800 border-b border-slate-100 align-middle">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                              <span className="truncate max-w-xs sm:max-w-md block" title={doc.title}>
                                {doc.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-800 border-b border-slate-100 align-middle">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                              {getDocTypeLabel(doc.docType)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-500 border-b border-slate-100 align-middle">
                            v{doc.version}
                          </td>
                          <td className="px-4 py-3 text-center border-b border-slate-100 align-middle">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-50 text-slate-600 border border-slate-200">
                              {doc.fileFormat}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600 border-b border-slate-100 align-middle">
                            {formatFileSize(doc.fileSize)}
                          </td>
                          <td className="px-4 py-3 border-b border-slate-100 align-middle">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleView(doc)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold hover:cursor-pointer transition-colors"
                                title="Open in new tab"
                              >
                                <Eye size={13} />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => handleDownload(doc)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold hover:cursor-pointer transition-colors"
                                title="Download file"
                              >
                                <Download size={13} />
                                <span>Download</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredDocuments.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 bg-white">
                            No documents associated with this product.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center flex-1 min-h-[380px] shadow-2xs">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                <BookOpen size={30} />
              </div>
              <h3 className="text-base font-bold text-slate-800">Select a Product</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                Choose a product from the directory on the left to see the approved sales specifications, manuals, and collateral.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDocument;
