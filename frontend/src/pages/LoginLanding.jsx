import React from "react";

import LoginLeftSide from "../components/LoginLeftSide";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";

const LoginLanding = () => {
  const portalOptions = [
    {
      to: "/login/admin",
      title: "Admin Portal",
      description:
        "Manage employees,products and documents related to products",
      icon: "ShieldIcon",
    },
    {
      to: "/login/employee",
      title: "Employee Portal",
      description: "Access the Documents relted to products",
      icon: "UserIcon",
    },
  ];
  return (
    <div className="min-h-screen overflow-hidden flex flex-col md:flex-row">
      <LoginLeftSide />

      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative overflow-y-auto min-h-screen">
        <div className="w-full max-w-md animate-fade-in relative z-10">
          <div className="text-center md:text-left mb-10">
            <h1 className="text-3xl text-slate-900 font-medium tracking-tight mb-3">
              Welcome Back
            </h1>
            <p className="text-slate-500">
              Select your portal to securely access your system.
            </p>
          </div>
          {/* Portals list */}
          <div className="space-y-4">
            {portalOptions.map((portal) => (
              <Link
                key={portal.to}
                to={portal.to}
                className="group block bg-slate-50 border border-slate-200 rounded-lg p-5 sm:p-6 transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50"
              >
                <div className="relative z-10 flex items-center justify-between gap-4 sm:gap-5">
                  <h3 className="text-lg text-slate-800 group-hover:text-indigo-600 mb-1transition-colors">
                    {portal.title}
                  </h3>
                  <ArrowRightIcon className="w-4 h-4text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-allduration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLanding;
