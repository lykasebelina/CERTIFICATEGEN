import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/public/Home";
import SignInModal from "./pages/public/Signin";
import SignupModal from "./pages/public/Signup";
import CertificateStudio from "./pages/app/CertificateStudio";
import CertificateEditor from "./pages/app/CertificateEditor";
import PublicLayout from "./layouts/PublicLayout";
import PrivateLayout from "./layouts/PrivateLayout";


function App() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (data: { email: string; password: string }) => {
    console.log("Sign in data:", data);

    // ✅ simulate successful login
    localStorage.setItem("isAuthenticated", "true");

    setIsSignInOpen(false);
    navigate("/studio");
  };

  const handleSignUp = (data: { email: string; password: string; confirmPassword: string }) => {
    console.log("Sign up data:", data);
    setIsSignUpOpen(false);
  };

  return (
    <>
      <Routes>
        {/* ✅ Public routes */}
        <Route
          element={
            <PublicLayout
              onSignIn={() => setIsSignInOpen(true)}
              onSignUp={() => setIsSignUpOpen(true)}
            />
          }
        >
          <Route path="/" element={<Home onNavigate={() => {}} />} />
          <Route path="/features" element={<div className="text-white p-10">Features Page</div>} />
          <Route path="/demo" element={<div className="text-white p-10">Demo Page</div>} />
          <Route path="/about" element={<div className="text-white p-10">About Page</div>} />
        </Route>

        {/* ✅ Private routes (protected by PrivateLayout) */}
        <Route element={<PrivateLayout />}>
          <Route path="/studio" element={<CertificateStudio />} />
          <Route path="/certificate-editor" element={<CertificateEditor />} />
        </Route>



        {/* 404 fallback */}
        <Route path="*" element={<div className="text-white p-10">Page Not Found</div>} />
      </Routes>

      {/* ✅ Modals */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSignIn={handleSignIn}
        onSignUp={() => {
          setIsSignInOpen(false);
          setIsSignUpOpen(true);
        }}
        onForgotPassword={() => console.log("Forgot password clicked")}
      />

      <SignupModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSignUp={handleSignUp}
        onSignIn={() => {
          setIsSignUpOpen(false);
          setIsSignInOpen(true);
        }}
      />
    </>
  );
}

export default App;
