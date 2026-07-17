import React, { useEffect, useState, useContext } from "react";
import Loading from "../components/Loading";
import { Plus, SearchIcon, Pencil, Trash2, XIcon, Download, Eye, FileText, Upload } from "lucide-react";
import { api } from "../api/axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Document = () => {
  // ---------- context ----------
  const { getAuthHeaders } = useContext(AppContext);

  // ---------- state ----------
  const [documents, setDocuments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // modal visibility
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // selected document for edit
  const [selectedDoc, setSelectedDoc] = useState(null);

  // form states
  const [newDoc, setNewDoc] = useState({
    productId: "",
    title: "",
    docType: "brochure",
    version: "1.0",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const [editDoc, setEditDoc] = useState({
    productId: "",
    title: "",
    docType: "brochure",
    version: "1.0",
  });
  const [selectedEditFile, setSelectedEditFile] = useState(null);

  // ---------- fetch products & documents ----------
  const fetchData = async () => {
    try {
      setLoading(true);
      const [docsResponse, productsResponse] = await Promise.all([
        api.get("/api/documents", { headers: getAuthHeaders() }),
        api.get("/api/products", { headers: getAuthHeaders() }),
      ]);

      if (docsResponse.data.success) {
        setDocuments(docsResponse.data.documents);
      } else {
        setError("Failed to load documents");
      }

      if (productsResponse.data.success) {
        setProducts(productsResponse.data.products);
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  // ---------- handlers ----------
  const handleInput = (e, setter) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, setter) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    }
  };

  // Upload document
  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!newDoc.productId || !newDoc.title || !newDoc.docType) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("productId", newDoc.productId);
      formData.append("title", newDoc.title);
      formData.append("docType", newDoc.docType);
      formData.append("version", newDoc.version);
      formData.append("file", selectedFile);

      const { data } = await api.post("/api/documents", formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success(data.message);
        setNewDoc({
          productId: "",
          title: "",
          docType: "brochure",
          version: "1.0",
        });
        setSelectedFile(null);
        setShowCreateModal(false);
        await fetchData();
      } else {
        toast.error(data.message || "Failed to upload document");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  // Edit / Replace document
  const handleEditDocument = async (e) => {
    e.preventDefault();
    if (!editDoc.productId || !editDoc.title || !editDoc.docType) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("productId", editDoc.productId);
      formData.append("title", editDoc.title);
      formData.append("docType", editDoc.docType);
      formData.append("version", editDoc.version);
      if (selectedEditFile) {
        formData.append("file", selectedEditFile);
      }

      const { data } = await api.put(`/api/documents/${selectedDoc._id}`, formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success(data.message);
        setShowEditModal(false);
        setSelectedDoc(null);
        setSelectedEditFile(null);
        await fetchData();
      } else {
        toast.error(data.message || "Failed to update document");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const openEditModal = (doc) => {
    setSelectedDoc(doc);
    setEditDoc({
      productId: doc.productId?._id || "",
      title: doc.title,
      docType: doc.docType || "brochure",
      version: doc.version || "1.0",
    });
    setSelectedEditFile(null);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      const { data } = await api.delete(`/api/documents/${id}`, {
        headers: getAuthHeaders(),
      });
      if (data.success) {
        toast.success(data.message);
        await fetchData();
      } else {
        toast.error(data.message || "Failed to delete document");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const handleView = (doc) => {
    const fileUrl = `${api.defaults.baseURL}/${doc.fileUrl}`;
    window.open(fileUrl, "_blank");
  };

  // ---------- filtering ----------
  const filtered = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesProduct = productFilter ? doc.productId?._id === productFilter : true;
    const matchesType = typeFilter ? doc.docType === typeFilter : true;
    return matchesSearch && matchesProduct && matchesType;
  });

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">Upload and manage product documents</p>
        </div>
        <button
          onClick={() => {
            // Pick first product as default if available
            setNewDoc({
              productId: products[0]?._id || "",
              title: "",
              docType: "brochure",
              version: "1.0",
            });
            setSelectedFile(null);
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center w-full sm:w-auto gap-2 btn-primary hover:cursor-pointer"
        >
          <Plus />
          <p>Add Document</p>
        </button>
      </div>

      {error && <p className="text-center text-red-500 mb-4">{error}</p>}

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by title..."
            className="pl-10 w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Document Types</option>
            <option value="brochure">Brochure</option>
            <option value="specification">Technical Specification</option>
            <option value="manual">User Manual</option>
            <option value="presentation">Presentation</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="overflow-x-auto rounded-lg shadow-sm bg-white border border-gray-200">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-left text-gray-600 border-b border-gray-200">Title</th>
              <th className="px-4 py-3 font-medium text-left text-gray-600 border-b border-gray-200">Product</th>
              <th className="px-4 py-3 font-medium text-left text-gray-600 border-b border-gray-200">Type</th>
              <th className="px-4 py-3 font-medium text-center text-gray-600 border-b border-gray-200">Version</th>
              <th className="px-4 py-3 font-medium text-center text-gray-600 border-b border-gray-200">Format</th>
              <th className="px-4 py-3 font-medium text-right text-gray-600 border-b border-gray-200">Size</th>
              <th className="px-4 py-3 font-medium text-center text-gray-600 border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => (
              <tr key={doc._id} className="hover:bg-gray-50 even:bg-gray-50">
                <td className="px-4 py-3 font-medium text-slate-800 border-b border-gray-200 align-middle">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{doc.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-800 border-b border-gray-200 align-middle">
                  {doc.productId?.name || <span className="text-gray-400 italic">Unknown Product</span>}
                </td>
                <td className="px-4 py-3 text-slate-800 border-b border-gray-200 align-middle">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    {getDocTypeLabel(doc.docType)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-slate-600 border-b border-gray-200 align-middle">
                  v{doc.version || "1.0"}
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-200 align-middle">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {doc.fileFormat}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-600 border-b border-gray-200 align-middle">
                  {formatFileSize(doc.fileSize)}
                </td>
                <td className="px-4 py-3 border-b border-gray-200 align-middle">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleView(doc)}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-500 hover:border-indigo-200 transition-colors hover:cursor-pointer"
                      title="View / Download"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => openEditModal(doc)}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-500 hover:border-indigo-200 transition-colors hover:cursor-pointer"
                      title="Edit / Replace"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id)}
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
                <td colSpan={7} className="p-8 text-center text-slate-400 bg-white border border-dashed border-slate-200">
                  No documents found. Click "Add Document" to upload a new resource.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ----------- Add Document Modal ----------- */}
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
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Add New Document</h2>
                <p className="text-sm text-gray-500 mt-1">Upload resource for a product</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              >
                <XIcon />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddDocument} className="space-y-6">
                <div className="card p-5 sm:p-6 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 gap-6 text-sm text-gray-700">
                    {/* Product Select */}
                    <div>
                      <label className="block mb-2 font-medium text-slate-700">Select Product <span className="text-red-500">*</span></label>
                      <select
                        name="productId"
                        required
                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        value={newDoc.productId}
                        onChange={(e) => handleInput(e, setNewDoc)}
                      >
                        <option value="" disabled>-- Choose a Product --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block mb-2 font-medium text-slate-700">Document Title <span className="text-red-500">*</span></label>
                      <input
                        name="title"
                        type="text"
                        required
                        placeholder="Enter document title"
                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        value={newDoc.title}
                        onChange={(e) => handleInput(e, setNewDoc)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Document Type */}
                      <div>
                        <label className="block mb-2 font-medium text-slate-700">Document Type <span className="text-red-500">*</span></label>
                        <select
                          name="docType"
                          required
                          className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          value={newDoc.docType}
                          onChange={(e) => handleInput(e, setNewDoc)}
                        >
                          <option value="brochure">Brochure</option>
                          <option value="specification">Technical Specification</option>
                          <option value="manual">User Manual</option>
                          <option value="presentation">Presentation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Version */}
                      <div>
                        <label className="block mb-2 font-medium text-slate-700">Version</label>
                        <input
                          name="version"
                          type="text"
                          placeholder="e.g. 1.0"
                          className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          value={newDoc.version}
                          onChange={(e) => handleInput(e, setNewDoc)}
                        />
                      </div>
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="block mb-2 font-medium text-slate-700">Upload File <span className="text-red-500">*</span></label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md bg-white hover:bg-slate-50 transition-colors relative">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-slate-400" />
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label className="relative cursor-pointer bg-white rounded-md font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-hidden">
                              <span>Choose a file</span>
                              <input
                                type="file"
                                required
                                className="sr-only"
                                onChange={(e) => handleFileChange(e, setSelectedFile)}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF, Word, Excel, PowerPoint, Text up to 10MB</p>
                          {selectedFile && (
                            <p className="text-sm font-medium text-emerald-600 mt-2">
                              Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 hover:cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 hover:cursor-pointer"
                  >
                    Upload Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ----------- Edit Document Modal ----------- */}
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
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit / Replace Document</h2>
                <p className="text-sm text-gray-500 mt-1">Update details or upload a new revision</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              >
                <XIcon />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditDocument} className="space-y-6">
                <div className="card p-5 sm:p-6 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-1 gap-6 text-sm text-gray-700">
                    {/* Product Select */}
                    <div>
                      <label className="block mb-2 font-medium text-slate-700">Select Product <span className="text-red-500">*</span></label>
                      <select
                        name="productId"
                        required
                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        value={editDoc.productId}
                        onChange={(e) => handleInput(e, setEditDoc)}
                      >
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block mb-2 font-medium text-slate-700">Document Title <span className="text-red-500">*</span></label>
                      <input
                        name="title"
                        type="text"
                        required
                        placeholder="Enter document title"
                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        value={editDoc.title}
                        onChange={(e) => handleInput(e, setEditDoc)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Document Type */}
                      <div>
                        <label className="block mb-2 font-medium text-slate-700">Document Type <span className="text-red-500">*</span></label>
                        <select
                          name="docType"
                          required
                          className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          value={editDoc.docType}
                          onChange={(e) => handleInput(e, setEditDoc)}
                        >
                          <option value="brochure">Brochure</option>
                          <option value="specification">Technical Specification</option>
                          <option value="manual">User Manual</option>
                          <option value="presentation">Presentation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Version */}
                      <div>
                        <label className="block mb-2 font-medium text-slate-700">Version</label>
                        <input
                          name="version"
                          type="text"
                          placeholder="e.g. 1.1"
                          className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          value={editDoc.version}
                          onChange={(e) => handleInput(e, setEditDoc)}
                        />
                      </div>
                    </div>

                    {/* File Upload (Optional replacement) */}
                    <div>
                      <label className="block mb-2 font-medium text-slate-700">Replace File <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md bg-white hover:bg-slate-50 transition-colors relative">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-slate-400" />
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label className="relative cursor-pointer bg-white rounded-md font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-hidden">
                              <span>Choose a file</span>
                              <input
                                type="file"
                                className="sr-only"
                                onChange={(e) => handleFileChange(e, setSelectedEditFile)}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">Leave empty to keep the current file</p>
                          {selectedEditFile ? (
                            <p className="text-sm font-medium text-emerald-600 mt-2">
                              New file selected: {selectedEditFile.name} ({formatFileSize(selectedEditFile.size)})
                            </p>
                          ) : (
                            selectedDoc && (
                              <p className="text-sm text-indigo-500 mt-2">
                                Current file: {selectedDoc.title}.{selectedDoc.fileFormat}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedDoc(null);
                      setSelectedEditFile(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 hover:cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 hover:cursor-pointer"
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

export default Document;
