import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PrivateLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (!user) {
  return <Navigate to="/" replace />;
}


  return (
    <div className="flex min-h-screen bg-[#0b1221] text-white">
      <Outlet />
    </div>
  );
};

export default PrivateLayout;
