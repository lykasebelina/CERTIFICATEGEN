import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [linkExpired, setLinkExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 🚫 Check if reset link is already used
    const used = sessionStorage.getItem("resetLinkUsed");
    if (used) {
      setLinkExpired(true);
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (linkExpired) {
      setMessage("❌ This password reset link has already been used.");
      return;
    }

    if (!password || password.length < 6) {
      setMessage("⚠️ Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("⚠️ Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage("❌ " + error.message);
      return;
    }

    // ✅ Mark reset link as used
    sessionStorage.setItem("resetLinkUsed", "true");
    localStorage.removeItem("isPasswordResetFlow");

    setMessage("✅ Password updated successfully! Redirecting...");
    setTimeout(() => {
      navigate("/app/studio/ai-generate", { replace: true });
    }, 2000);
  };

  if (linkExpired) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-3">Link Expired</h2>
          <p>This password reset link has already been used or expired.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleReset}
        className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Reset Your Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded-lg text-black"
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded-lg text-black"
        />

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold"
        >
          Reset Password
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-300">{message}</p>
        )}
      </form>
    </div>
  );
}
