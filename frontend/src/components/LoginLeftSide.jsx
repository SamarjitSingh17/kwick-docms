import React from "react";

const LoginLeftSide = () => {
  return (
    <div className="hidden md:flex w-1/2 bg-indigo-950 relative overflow-hidden border-r border-slate-200">
      <div className="absolute -top-30 -left-30 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div className="flex flex-col items-center justify-center relative z-10 h-full w-full">
        <h1 className="text-4xl lg:text-5xl text-white font-medium mb-6 leading-tight tracking-tight">
          Kwick Forensic <br /> Document Management System
        </h1>
        <p className="text-lg text-gray-300  leading-relaxed">
          Centralize your product resources, empower your sales team, and track
          usage securely.
        </p>
      </div>
    </div>
  );
};

export default LoginLeftSide;
