//PublicLayout.tsx file

import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AuthModal from "../pages/public/AuthModal";
import { useAuth } from "@/context/AuthContext";

interface PublicLayoutProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export default function PublicLayout({ onSignIn, onSignUp }: PublicLayoutProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const handleSignIn = () => {
    setAuthMode("signin");
    setIsAuthModalOpen(true);
  };

  const handleSignUp = () => {
    setAuthMode("signup");
    setIsAuthModalOpen(true);
  };


  
  // ✅ Redirect only when user is confirmed


 //// useEffect(() => {
  ////if (!loading && user) {
   //// navigate("/app/studio/ai-generate", { replace: true });
//  }
//}, [user, loading, navigate]);

//This ensures your app won’t redirect during the reset password session.
useEffect(() => {
  const isResetFlow = localStorage.getItem("isPasswordResetFlow");

  if (!loading && user && !isResetFlow) {
    navigate("/app/studio/ai-generate", { replace: true });
  }
}, [user, loading, navigate]);



  // ✅ Open SignIn modal when ?showSignIn=true is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("showSignIn") === "true") {
      handleSignIn();
    }
  }, []);

  // ✅ Close modal when user logs in (even from another tab)
  useEffect(() => {
    if (!loading && user) {
      setIsAuthModalOpen(false);
      navigate("/app/studio/ai-generate", { replace: true });
    }
  }, [user, loading, navigate]);

  // ✅ Optional: Prevent flash during Supabase session check
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar onSignIn={onSignIn ?? handleSignIn} onSignUp={onSignUp ?? handleSignUp} />

      {/* ✅ Only show AuthModal when NO user is logged in */}
      {!user && isAuthModalOpen && (
  <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authMode}
        />
      )}

      <main className="relative z-10 pt-20">
        <Outlet />
      </main>
    </div>
  );
}
