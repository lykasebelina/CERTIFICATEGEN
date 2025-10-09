import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

interface PublicLayoutProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ onSignIn, onSignUp }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar onSignIn={onSignIn} onSignUp={onSignUp} />
      <main className="relative z-10 pt-20">
        <Outlet /> {/* renders all public routes here */}
      </main>
    </div>
  );
};

export default PublicLayout;
