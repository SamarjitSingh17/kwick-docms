import { createContext, useState } from "react";
import { api } from "../api/axios";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  // User info persisted in localStorage; JWT stored in HttpOnly cookie
  const savedUser = localStorage.getItem("user");
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);

  // login receives only user object (backend sets cookie)
  const login = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (e) {
      console.error("Logout error", e);
    }
    localStorage.removeItem("user");
    setUser(null);
  };

  // No Authorization header needed; cookies are sent automatically
  const getAuthHeaders = () => ({});

  const value = {
    user,
    role: user?.role,
    isAuthenticated: !!user,
    login,
    logout,
    getAuthHeaders,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
