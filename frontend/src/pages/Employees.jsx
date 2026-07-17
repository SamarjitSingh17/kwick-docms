import React, { useContext, useEffect, useState } from "react";
import Loading from "../components/Loading";

import { Plus, SearchIcon, Pencil, Trash2, XIcon } from "lucide-react";
import { api } from "../api/axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Employees = () => {
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const { getAuthHeaders } = useContext(AppContext);

  // to add new employee
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
  });
  // to update the employee:
  const [editEmployee, setEditEmployee] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/employees", {
        headers: getAuthHeaders(),
      });

      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter((e) =>
    `${e.name}`.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post("/api/employees", newEmployee, {
        headers: getAuthHeaders(),
      });
      if (data.success) {
        setShowCreateModal(false);
        setNewEmployee({
          name: "",
          email: "",
          password: "",
        });
        fetchEmployees();
        toast.success(data.message);
      }
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
      toast.error(error.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setEditEmployee({
      name: employee.name,
      email: employee.email,
      password: "",
    });
    setShowEditModal(true);
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: editEmployee.name,
        email: editEmployee.email,
      };

      if (editEmployee.password) {
        payload.password = editEmployee.password;
      }

      const { data } = await api.put(
        `/api/employees/${selectedEmployee._id}`,
        payload,
        {
          headers: getAuthHeaders(),
        },
      );

      if (data.success) {
        toast.success(data.message);
        setShowEditModal(false);
        setSelectedEmployee(null);
        fetchEmployees();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteEmployee = async (id) => {
    const confirmDelete = window.confirm(
      "Are you Sure You want to delete this employee",
    );
    if (!confirmDelete) return;

    try {
      const { data } = await api.delete(`/api/employees/${id}`, {
        headers: getAuthHeaders(),
      });

      if (data.success) {
        toast.success(data.message);
        fetchEmployees();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage Your Team Members</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center w-full sm:w-auto gap-2 btn-primary hover:cursor-pointer"
        >
          <Plus />
          <p>Add Employee</p>
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="flex-1 relative">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employees..."
            className="pl-10 w-full"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </div>
      </div>

      {/* Employees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-5">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            No Employees Found
          </p>
        ) : (
          filtered.map((employee) => (
            <div
              key={employee._id}
              className="bg-white rounded-2xl border border-slate-100 flex items-center justify-between px-5 py-4 hover:shadow-sm transition-shadow duration-200"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-400 font-semibold text-sm shrink-0">
                  {employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <p className="font-medium text-slate-800">{employee.name}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(employee)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-500 hover:border-indigo-200 transition-colors hover:cursor-pointer"
                  aria-label="Edit employee"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDeleteEmployee(employee._id)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors hover:cursor-pointer"
                  aria-label="Delete employee"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Employee Modal */}
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
                <h2 className="text-lg font-semibold text-slate-900">
                  Add New Employee
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                  Create Employee Account
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <XIcon />
              </button>
            </div>
            <div className="p-6">
              <form
                onSubmit={handleAddEmployee}
                className="max-w-3xl animate-fade-in"
              >
                <div className="card p-5 sm:p-6">
                  <h3 className="font-medium mb-6 pb-5 border-b border-slate-100">
                    Employee Details
                  </h3>
                  <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 space-y-6">
                    <div>
                      <label className="block mb-2">Name</label>
                      <input
                        type="text"
                        className="w-full"
                        placeholder="Enter employee name"
                        value={newEmployee.name}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full"
                        placeholder="Enter employee email"
                        value={newEmployee.email}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Password</label>
                      <input
                        type="password"
                        className="w-full"
                        placeholder="Enter password"
                        value={newEmployee.password}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-4 mt-4">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="btn-secondary"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Add Employee
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div
          className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-start justify-center overflow-y-auto"
          onClick={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
        >
          <div className="fixed inset-0" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in"
          >
            <div className="flex items-center justify-between p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Edit Employee
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                  Update Employee Details
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedEmployee(null);
                }}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <XIcon />
              </button>
            </div>
            <div className="p-6">
              <form
                onSubmit={handleEditEmployee}
                className="max-w-3xl animate-fade-in"
              >
                <div className="card p-5 sm:p-6">
                  <h3 className="font-medium mb-6 pb-5 border-b border-slate-100">
                    Employee Details
                  </h3>
                  <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 space-y-6">
                    <div>
                      <label className="block mb-2">Name</label>
                      <input
                        type="text"
                        className="w-full"
                        placeholder="Enter employee name"
                        value={editEmployee.name}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full"
                        placeholder="Enter employee email"
                        value={editEmployee.email}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full"
                        placeholder="Enter new password (optional)"
                        value={editEmployee.password}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-4 mt-4">
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedEmployee(null);
                      }}
                      className="btn-secondary"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
