import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateLayout: React.FC = () => {
  // ✅ temporary placeholder (replace with real auth check later)
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // ✅ redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#0b1221] text-white">
      {/* This will render the Sidebar and content from CertificateStudio */}
      <Outlet />
    </div>
  );
};

export default PrivateLayout;
