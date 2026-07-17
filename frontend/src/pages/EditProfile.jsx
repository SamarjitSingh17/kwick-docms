import React, { useContext, useState } from "react";
import { EyeClosed, EyeIcon, Loader2Icon } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../api/axios";
import { AppContext } from "../context/AppContext";

const EditProfile = () => {
  const { user, role, getAuthHeaders } = useContext(AppContext);
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.put("/api/auth/change-password", form, {
        headers: getAuthHeaders(),
      });

      if (data.success) {
        toast.success(data.message);
        resetForm();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Edit Profile</h1>
        <p className="page-subtitle">
          Manage your {role === "ADMIN" ? "admin" : "employee"} password
        </p>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="mb-6 pb-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            Account Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Name</p>
              <p className="font-medium text-slate-800">{user?.name}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Email</p>
              <p className="font-medium text-slate-800">{user?.email}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Role</p>
              <p className="font-medium text-slate-800">
                {role === "ADMIN" ? "Administrator" : "Employee"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              New Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm New Password
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
          >
            {showPasswords ? <EyeClosed size={16} /> : <EyeIcon size={16} />}
            {showPasswords ? "Hide passwords" : "Show passwords"}
          </button>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary"
              disabled={loading}
            >
              Reset
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2Icon className="h-4 w-4 animate-spin" />}
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
