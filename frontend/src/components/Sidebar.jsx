import { useContext, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

import {
  ChevronRightIcon,
  File,
  IdCard,
  LayoutGrid,
  LogOutIcon,
  MenuIcon,
  Package,
  Shield,
  UserIcon,
  UserPen,
  XIcon,
} from "lucide-react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Sidebar = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, role, logout } = useContext(AppContext);
  const userName = user?.name || "";

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },

    ...(role === "ADMIN"
      ? [
          { name: "Products", href: "/products", icon: Package },
          { name: "Documents", href: "/documents", icon: File },
          { name: "Employees", href: "/employees", icon: IdCard },
          { name: "Audit Log", href: "/auditLog", icon: Shield },
          {
            name: "Edit Profile",
            href: "/editProfile/admin",
            icon: UserPen,
          },
        ]
      : []),

    ...(role === "EMPLOYEE"
      ? [
          {
            name: "Product and Documents",
            href: "/productsDoc",
            icon: Package,
          },
          {
            name: "Edit Profile",
            href: "/editProfile/employee",
            icon: UserPen,
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out Successfully!");
  };

  const sideBarContent = (
    <>
      {/* brand header */}
      <div className="px-5 pt-5 pb-5 border-b border-white/6">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <UserIcon className="text-white size-7" />
            <div className="flex flex-col gap-1">
              <h3 className="text-white text-[13px] font-semibold">
                Document MS
              </h3>
              <p className="text-[11px] text-slate-500">Management System</p>
            </div>
          </div>
          <XIcon
            onClick={() => setMobileOpen(false)}
            size={28}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          />
        </div>
      </div>
      {/* user profile card */}
      {userName && (
        <div className="mx-3 mt-3 mb-1 p-3 rounded-lg bg-white/3 border border-white/4">
          <div className="flex gap-3 items-center">
            <div className="flex items-center justify-center bg-slate-800 w-9 h-9 p-3 rounded-lg">
              <span className="text-slate-400 text-xs font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] text-slate-200 font-semibold">
                {userName}
              </h3>
              <p className="text-[11px] text-slate-500">
                {role === "ADMIN" ? "Administrator" : "Employee"}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* navigation label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[11px] font-semibold text-slate-500 ">NAVIGATION</p>
      </div>
      {/* navigation list */}
      <div className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-300"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-300"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-500" />
              )}

              <item.icon
                className={`w-[17px] h-[17px] shrink-0 ${
                  isActive
                    ? "text-indigo-300"
                    : "text-slate-400 group-hover:text-slate-300"
                }`}
              />

              <span className="flex-1">{item.name}</span>

              {isActive && (
                <ChevronRightIcon className="w-3.5 h-3.5 text-indigo-500/50" />
              )}
            </Link>
          );
        })}
      </div>
      {/* Logout at */}
      <div className="p-3 border-t border-white/6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-[13px] font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/8 transition-all duration-150"
        >
          <LogOutIcon className="w-[17px] h-[17px]" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu icon */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg border border-white/10"
      >
        <MenuIcon size={20} />
      </button>
      {/* Mobile OverLay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
      )}
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col h-full w-65 bg-linear-to-b from-slate-900 via-slate-900 to-slate-900 text-white shrink-0 border-r border-white/4">
        {sideBarContent}{" "}
      </aside>
      {/* sidebar mobile  */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-linear-to-b from-slate-900 via-slate-900 to-slate-900 text-white z-50 flex flex-col transform transition-transform duration-300  ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sideBarContent}
      </aside>
    </>
  );
};

export default Sidebar;
