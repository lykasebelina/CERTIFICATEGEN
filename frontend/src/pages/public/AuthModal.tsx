import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, X, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import OtpModal from "./OtpModal";

type Mode = "signin" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: Mode;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

interface LockoutInfo {
  failedAttempts: number;
  lockedUntil: number | null;
}

const LOCKOUT_LIMIT = 5;
const LOCKOUT_DURATION = 3 * 60 * 1000;

const OTP_LIMIT = 3;
const OTP_WINDOW = 5 * 60 * 1000;
const OTP_LOCK_DURATION = 60 * 1000;

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "signin",
}: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lockout, setLockout] = useState<LockoutInfo>({
    failedAttempts: 0,
    lockedUntil: null,
  });
  const [countdown, setCountdown] = useState(0);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");

  const [otpLock, setOtpLock] = useState<{ lockedUntil: number | null }>({
    lockedUntil: null,
  });
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("auth_lockout");
    if (saved) {
      const parsed: LockoutInfo = JSON.parse(saved);
      if (parsed.lockedUntil && Date.now() < parsed.lockedUntil) {
        setLockout(parsed);
        setCountdown(Math.ceil((parsed.lockedUntil - Date.now()) / 1000));
      } else {
        localStorage.removeItem("auth_lockout");
      }
    }
  }, []);

  useEffect(() => {
    if (lockout.lockedUntil && Date.now() < lockout.lockedUntil) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((lockout.lockedUntil! - Date.now()) / 1000);
        setCountdown(remaining > 0 ? remaining : 0);
        if (remaining <= 0) {
          setLockout({ failedAttempts: 0, lockedUntil: null });
          localStorage.removeItem("auth_lockout");
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockout]);

  useEffect(() => {
    const saved = localStorage.getItem("otp_lock");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.lockedUntil && Date.now() < parsed.lockedUntil) {
        setOtpLock(parsed);
        setOtpCountdown(Math.ceil((parsed.lockedUntil - Date.now()) / 1000));
      } else {
        localStorage.removeItem("otp_lock");
      }
    }
  }, []);

  useEffect(() => {
    if (otpLock.lockedUntil && Date.now() < otpLock.lockedUntil) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((otpLock.lockedUntil! - Date.now()) / 1000);
        setOtpCountdown(remaining > 0 ? remaining : 0);
        if (remaining <= 0) {
          setOtpLock({ lockedUntil: null });
          localStorage.removeItem("otp_lock");

          const allKeys = Object.keys(localStorage);
          for (const key of allKeys) {
            if (key.startsWith("otp_requests_")) localStorage.removeItem(key);
          }

          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpLock]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFormData({ email: "", password: "", confirmPassword: "", firstName: "", lastName: "" });
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, initialMode]);

  const trackOtpRequest = (email: string): boolean => {
    const key = `otp_requests_${email}`;
    const now = Date.now();

    const record = JSON.parse(localStorage.getItem(key) || "[]") as number[];

    const filtered = record.filter((t) => now - t < OTP_WINDOW);

    if (filtered.length === 0) {
      localStorage.setItem(key, JSON.stringify([now]));
      return true;
    }

    filtered.push(now);
    localStorage.setItem(key, JSON.stringify(filtered));

    if (filtered.length > OTP_LIMIT) {
      const lockedUntil = now + OTP_LOCK_DURATION;
      localStorage.setItem("otp_lock", JSON.stringify({ lockedUntil }));
      setOtpLock({ lockedUntil });
      setOtpCountdown(OTP_LOCK_DURATION / 1000);
      alert("⚠️ Too many OTP requests. Please wait 1 minute before retrying.");
      return false;
    }

    return true;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must include uppercase, lowercase, and a number";
    }

    if (mode === "signup") {
      if (!formData.firstName?.trim()) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.lastName?.trim()) {
        newErrors.lastName = "Last name is required";
      }
      if (!formData.confirmPassword)
        newErrors.confirmPassword = "Please confirm your password";
      else if (formData.confirmPassword !== formData.password)
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateLockout = (failed: boolean) => {
    if (!failed) {
      setLockout({ failedAttempts: 0, lockedUntil: null });
      localStorage.removeItem("auth_lockout");
      return;
    }

    const newAttempts = lockout.failedAttempts + 1;
    if (newAttempts >= LOCKOUT_LIMIT) {
      const lockedUntil = Date.now() + LOCKOUT_DURATION;
      const updated = { failedAttempts: newAttempts, lockedUntil };
      setLockout(updated);
      localStorage.setItem("auth_lockout", JSON.stringify(updated));
      setCountdown(LOCKOUT_DURATION / 1000);
      alert("⚠️ Too many failed attempts. Please wait 3 minutes before retrying.");
    } else {
      const updated = {
        failedAttempts: newAttempts,
        lockedUntil: lockout.lockedUntil,
      };
      setLockout(updated);
      localStorage.setItem("auth_lockout", JSON.stringify(updated));
    }
  };

  const handleOtpVerified = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      updateLockout(false);
      alert(`✅ Welcome, ${data.user.email}!`);
      onClose();
      setFormData({ email: "", password: "", confirmPassword: "", firstName: "", lastName: "" });
    } catch (err) {
      console.error("OTP verification error:", err);
      alert("❌ Failed to sign in after OTP verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const normalizedEmail = formData.email.trim().toLowerCase();

    if (lockout.lockedUntil && Date.now() < lockout.lockedUntil) {
      alert(`⏳ You are temporarily locked out. Try again in ${countdown}s.`);
      return;
    }

    if (otpLock.lockedUntil && Date.now() < otpLock.lockedUntil) {
      alert(`🚫 Too many OTP requests. Try again in ${otpCountdown}s.`);
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: formData.firstName?.trim(),
              last_name: formData.lastName?.trim(),
            }
          },
        });

        if (error) throw error;
        if (
          data.user &&
          data.user.identities &&
          data.user.identities.length === 0
        ) {
          setErrors((prev) => ({ ...prev, email: "Email already in use" }));
          setIsLoading(false);
          return;
        }

     //   if (data.user) {
          
    //      }
      //  }

        alert("✅ Verification email sent! Please check your inbox.");
        onClose();
        setFormData({ email: "", password: "", confirmPassword: "", firstName: "", lastName: "" });
        updateLockout(false);
      } else {
        await supabase.auth.signOut();

        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: formData.password,
          });

        if (signInError || !signInData.session) {
          updateLockout(true);
          alert("❌ Invalid email or password.");
          setIsLoading(false);
          return;
        }

        await supabase.auth.signOut();

        if (!trackOtpRequest(normalizedEmail)) {
          setIsLoading(false);
          return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const response = await fetch(
          "https://vusdhnuwunesusxgopow.supabase.co/functions/v1/send-otp",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ to: normalizedEmail, otp }),
          }
        );

        const result = await response.json();
        if (!response.ok || !result.success) {
          const errorMsg =
            result?.error || "❌ Failed to send OTP. Please try again.";
          alert(errorMsg);
          setIsLoading(false);
          return;
        }

        setGeneratedOtp(otp);
        setOtpModalOpen(true);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      alert("⚠️ Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Enter your email first" }));
      return;
    }
    const normalizedEmail = formData.email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) alert(error.message);
    else {
      alert("📩 Password reset email sent!");
      onClose();
      setFormData({ email: "", password: "", confirmPassword: "", firstName: "", lastName: "" });
    }
  };

  if (!isOpen) return null;

  const isLocked =
    lockout.lockedUntil && Date.now() < lockout.lockedUntil ? true : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-auto p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h2>

        {isLocked && (
          <div className="text-center text-red-600 font-medium mb-4">
            ⏳ Too many failed attempts. Try again in {countdown}s.
          </div>
        )}

        {otpLock.lockedUntil && Date.now() < otpLock.lockedUntil && (
          <div className="text-center text-red-600 font-medium mb-4">
            🚫 Too many OTP requests. Try again in {otpCountdown}s.
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                      errors.firstName
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                      errors.lastName
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                  errors.email
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                  errors.password
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {mode === "signup" && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                    errors.confirmPassword
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {mode === "signin" && (
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-purple-600 hover:underline"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isLocked}
            className={`w-full py-2 rounded-lg font-semibold transition ${
              isLocked
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            }`}
          >
            {isLocked
              ? `Locked (${countdown}s)`
              : isLoading
              ? mode === "signin"
                ? "Signing in..."
                : "Signing up..."
              : mode === "signin"
              ? "Sign In"
              : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {mode === "signin"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            className="text-purple-600 font-semibold hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Get started" : "Sign In"}
          </button>
        </p>
      </div>

      <OtpModal
        email={formData.email}
        generatedOtp={generatedOtp}
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerified={handleOtpVerified}
      />
    </div>
  );
}
