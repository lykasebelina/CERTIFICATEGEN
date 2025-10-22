import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AuthModal from "../pages/public/AuthModal";
import { useAuth } from "@/context/AuthContext";

interface PublicLayoutProps {
  onSignIn: () => void;
  onSignUp: () => void;
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

  useEffect(() => {
    if (!loading && user && user.email_confirmed_at) {
  navigate("/app/studio/ai-generate", { replace: true });
}
  }, [user, loading, navigate]);



  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar onSignIn={onSignIn ?? handleSignIn} onSignUp={onSignUp ?? handleSignUp} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      <main className="relative z-10 pt-20">
        <Outlet />
      </main>
    </div>
  );
}
