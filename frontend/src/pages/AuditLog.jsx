import React, { useEffect, useState, useContext } from "react";
import Loading from "../components/Loading";
import {
  Shield,
  SearchIcon,
  Calendar,
  Filter,
  User,
  BookOpen,
  FileText,
  RefreshCw,
  Eye,
  Download,
  XCircle,
} from "lucide-react";
import { api } from "../api/axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const AuditLog = () => {
  const { getAuthHeaders } = useContext(AppContext);

  // ---------- states ----------
  const [auditLogs, setAuditLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------- filter states ----------
  const [search, setSearch] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [productId, setProductId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [action, setAction] = useState("");
  const [date, setDate] = useState("");

  // ---------- fetch filter metadata (employees, products, documents) ----------
  const fetchMetadata = async () => {
    try {
      const [empRes, prodRes, docRes] = await Promise.all([
        api.get("/api/employees", { headers: getAuthHeaders() }),
        api.get("/api/products", { headers: getAuthHeaders() }),
        api.get("/api/documents", { headers: getAuthHeaders() }),
      ]);

      if (empRes.data.success) {
        setEmployees(empRes.data.employees);
      }
      if (prodRes.data.success) {
        setProducts(prodRes.data.products);
      }
      if (docRes.data.success) {
        // Admin gets all docs, so this will contain all
        setDocuments(docRes.data.documents);
      }
    } catch (e) {
      console.error("Failed to load metadata for filters", e);
    }
  };

  // ---------- fetch audit logs ----------
  const fetchAuditLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setLogsLoading(true);
      } else {
        setLoading(true);
      }

      // Build query string params
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (employeeId) params.append("employeeId", employeeId);
      if (productId) params.append("productId", productId);
      if (documentId) params.append("documentId", documentId);
      if (action) params.append("action", action);
      if (date) params.append("date", date);

      const { data } = await api.get(`/api/audit-logs?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (data.success) {
        setAuditLogs(data.auditLogs);
        setError("");
      } else {
        setError(data.message || "Failed to load audit logs");
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      toast.error("Error loading audit logs");
    } finally {
      setLoading(false);
      setLogsLoading(false);
    }
  };

  // ---------- initial fetch ----------
  useEffect(() => {
    const init = async () => {
      await fetchMetadata();
      await fetchAuditLogs();
    };
    init();
  }, []);

  // ---------- refetch when filters change ----------
  useEffect(() => {
    // debounce search input to avoid spamming the backend
    const delayDebounceFn = setTimeout(() => {
      fetchAuditLogs(true);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, employeeId, productId, documentId, action, date]);

  // ---------- reset filters ----------
  const handleResetFilters = () => {
    setSearch("");
    setEmployeeId("");
    setProductId("");
    setDocumentId("");
    setAction("");
    setDate("");
    toast.info("Filters cleared");
  };

  // ---------- helper: date formatter ----------
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const dateObj = new Date(dateStr);

    const day = dateObj.getDate();
    const monthNames = [
      "July", // Let's populate the full array to match user's custom formatting requirement
      "August",
      "September",
      "October",
      "November",
      "December",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
    ];
    // Map standard JS months to correct names
    const standardMonthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = standardMonthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "AM" : "PM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12

    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  };

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Shield className="text-indigo-600 w-7 h-7" />
            <span>Audit Log Dashboard</span>
          </h1>
          <p className="page-subtitle">
            Monitor employee document access, views, and downloads in real time
          </p>
        </div>
        <button
          onClick={() => fetchAuditLogs(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg hover:cursor-pointer transition-colors shadow-2xs border border-indigo-100"
        >
          <RefreshCw size={14} className={logsLoading ? "animate-spin" : ""} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Search & Filter Controls Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Filter size={16} className="text-indigo-500" />
            <span>Filter Access Logs</span>
          </div>
          {(search || employeeId || productId || documentId || action || date) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 transition-colors hover:cursor-pointer"
            >
              <XCircle size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Search bar */}
          <div className="relative">
            <label className="block text-slate-500 font-medium mb-1.5">Search Employee / Document</label>
            <div className="relative">
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type name or title..."
                className="pl-9 w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1.5">Action Type</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5"
            >
              <option value="">All Actions</option>
              <option value="view">View</option>
              <option value="download">Download</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1.5">Specific Access Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5 text-slate-700"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          {/* Employee Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1.5">By Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1.5">By Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Document Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1.5">By Document</label>
            <select
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-1.5"
            >
              <option value="">All Documents</option>
              {documents.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative">
        {logsLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-10 transition-all">
            <div className="flex flex-col items-center gap-2 text-indigo-600">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600"></div>
              <span className="text-xs font-semibold text-slate-500">Updating logs...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3.5 font-semibold text-left text-slate-700">User / Employee</th>
                <th className="px-5 py-3.5 font-semibold text-left text-slate-700">Product</th>
                <th className="px-5 py-3.5 font-semibold text-left text-slate-700">Document</th>
                <th className="px-5 py-3.5 font-semibold text-center text-slate-700">Action</th>
                <th className="px-5 py-3.5 font-semibold text-right text-slate-700">Access Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => {
                const userObj = log.userId;
                const docObj = log.documentId;
                const prodObj = docObj?.productId;

                return (
                  <tr key={log._id} className="hover:bg-slate-50/40 transition-colors">
                    {/* User */}
                    <td className="px-5 py-4 border-b border-slate-100 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                          {userObj ? userObj.name.charAt(0) : "?"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-800 truncate max-w-[160px]">
                            {userObj ? userObj.name : <span className="text-slate-400 italic">Deleted Employee</span>}
                          </h4>
                          <p className="text-xs text-slate-500 truncate max-w-[160px]">
                            {userObj ? userObj.email : "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-5 py-4 border-b border-slate-100 align-middle">
                      <div className="min-w-0">
                        {prodObj ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800 truncate max-w-[140px]" title={prodObj.name}>
                              {prodObj.name}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              {prodObj.category}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Deleted Product</span>
                        )}
                      </div>
                    </td>

                    {/* Document */}
                    <td className="px-5 py-4 border-b border-slate-100 align-middle">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className="text-indigo-400 shrink-0" />
                        <span className="font-medium text-slate-800 truncate max-w-[200px]" title={docObj ? docObj.title : "Deleted Document"}>
                          {docObj ? docObj.title : <span className="text-slate-400 italic">Deleted Document</span>}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 border-b border-slate-100 align-middle">
                      <div className="flex items-center justify-center">
                        {log.action === "view" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            <Eye size={11} />
                            <span>View</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Download size={11} />
                            <span>Download</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Access Time */}
                    <td className="px-5 py-4 border-b border-slate-100 align-middle text-right font-medium text-slate-600 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                  </tr>
                );
              })}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 bg-white">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Shield size={32} className="text-slate-300" />
                      <span className="text-sm font-semibold">No audit records found</span>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Try modifying your active filters or clear search query to find more records.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-50 border-t border-slate-150 px-5 py-3 text-xs text-slate-500 font-semibold flex justify-between items-center">
          <span>Total Records: {auditLogs.length}</span>
          <span>Logged-in Role: Admin</span>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;