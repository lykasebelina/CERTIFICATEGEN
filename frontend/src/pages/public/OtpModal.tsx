//OTPModal.tsx file

import React, { useState, useEffect } from "react";

interface OtpModalProps {
  email: string;
  generatedOtp: string;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export default function OtpModal({
  email,
  generatedOtp,
  isOpen,
  onClose,
  onVerified,
}: OtpModalProps) {
  const [otpInput, setOtpInput] = useState("");
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds

  // Reset modal every time it's opened or new OTP is generated
  useEffect(() => {
    if (isOpen) {
      setOtpInput("");
      setMessage("");
      setTimeLeft(300);
    }
  }, [isOpen, generatedOtp]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (timeLeft <= 0) {
      setMessage("⏳ OTP expired. Please try signing in again.");
      return;
    }

    if (otpInput.trim() === generatedOtp) {
      setMessage("✅ OTP verified!");
      setTimeout(() => {
        onVerified();
        onClose();
      }, 800);
    } else {
      setMessage("❌ Invalid OTP. Please check your email and try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-6 sm:p-8 z-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          OTP Verification
        </h2>
        <p className="text-gray-600 mb-4">
          We’ve sent a verification code to <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            maxLength={6}
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            placeholder="Enter 6-digit OTP"
            className="w-full border rounded-lg px-3 py-2 text-center text-lg tracking-widest focus:ring-2 focus:ring-purple-500 mb-3"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Verify OTP
          </button>
        </form>

        {message && (
          <p
            className={`mt-3 text-sm font-medium ${
              message.startsWith("✅")
                ? "text-green-600"
                : message.startsWith("⏳")
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-3 text-gray-500 text-sm">
          Expires in{" "}
          {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
