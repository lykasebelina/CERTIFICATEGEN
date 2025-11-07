// PrivateLayout.tsx file

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PrivateLayout: React.FC = () => {
  const { user, loading } = useAuth();

  // ✅ 1. Show loader while auth state initializes
  if (loading) return <div className="text-white p-10">Loading...</div>;

  // ✅ 2. Check if user is in password reset flow
  const isResetFlow = localStorage.getItem("isPasswordResetFlow");

  if (isResetFlow) {
    // 🔒 Block access to private pages during password reset flow
    return <Navigate to="/reset-password" replace />;
  }

  // ✅ 3. If not logged in, redirect to public landing
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ✅ 4. Authenticated user → allow access to private routes
  return (
    <div className="flex min-h-screen bg-[#0b1221] text-white">
      <Outlet />
    </div>
  );
};

export default PrivateLayout;
