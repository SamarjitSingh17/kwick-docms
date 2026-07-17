import React, { useContext, useEffect, useState } from "react";
import {
  dummyAdminDashboardData,
  dummyEmployeeDashboardData,
} from "../assets/assets";
import Loading from "../components/Loading";
import EmployeeDashboard from "../components/EmployeeDashboard";
import AdminDashboard from "../components/AdminDashboard";
import { AppContext } from "../context/AppContext";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, role } = useContext(AppContext);

  useEffect(() => {
    if (role === "ADMIN") {
      setData(dummyAdminDashboardData);
    }

    if (role === "EMPLOYEE") {
      setData(dummyEmployeeDashboardData);
    }

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [role]);

  if (loading) return <Loading />;
  if (!data)
    return (
      <p className="py-12 text-center text-slate-500">Failed to load data</p>
    );
  if (data.role === "ADMIN") {
    return <AdminDashboard data={data} user={user} />;
  } else {
    return <EmployeeDashboard data={data} user={user} />;
  }
};

export default Dashboard;
