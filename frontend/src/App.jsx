import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoginLanding from "./pages/LoginLanding";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Document from "./pages/Document";
import Employees from "./pages/Employees";
import AuditLog from "./pages/AuditLog";
import ProductDocument from "./pages/ProductDocument";
import EditProfile from "./pages/EditProfile";
import Layout from "./pages/Layout";
import LoginForm from "./components/LoginForm";
import { AppContext } from "./context/AppContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useContext(AppContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginLanding />} />
        <Route
          path="/login/admin"
          element={
            <LoginForm
              role="ADMIN"
              title="Admin Portal"
              subtitle="Login to manage employee products,documents"
            />
          }
        />
        <Route
          path="/login/employee"
          element={
            <LoginForm
              role="EMPLOYEE"
              title="Employee Portal"
              subtitle="Login to access documents related to products"
            />
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Products />
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Document />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Employees />
              </ProtectedRoute>
            }
          />

          <Route
            path="/auditLog"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AuditLog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editProfile/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* employee routes */}
          <Route
            path="/productsDoc"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <ProductDocument />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editProfile/employee"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
                <EditProfile />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default App;
