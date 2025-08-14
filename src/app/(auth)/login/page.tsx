"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Clock, AlertCircle } from "lucide-react";
import Image from "next/image";
import { tokenManager } from "@/lib/token-manager";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpExpiryCountdown, setOtpExpiryCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // OTP expiration time in seconds (5 minutes)
  const OTP_EXPIRY_TIME = 5 * 60; // 5 minutes
  const RESEND_COOLDOWN = 60; // 1 minute cooldown for resend

  useEffect(() => {
    const successMessage = searchParams.get("message");
    if (successMessage) {
      setMessage(successMessage);
    }

    // Check if user is already authenticated
    const checkAuth = async () => {
      // Add a small delay to ensure tokenManager is initialized
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (tokenManager.isAuthenticated()) {
        console.log("🔐 User already authenticated, redirecting to dashboard");
        router.push("/dashboard");
        return;
      }

      // Also check localStorage directly as fallback
      const token =
        localStorage.getItem("token") || localStorage.getItem("bossToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (token && refreshToken) {
        console.log(
          "🔐 Found tokens in localStorage, redirecting to dashboard"
        );
        router.push("/dashboard");
      }
    };

    checkAuth();
  }, [searchParams, router]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (otpExpiryCountdown > 0) {
      const timer = setTimeout(() => {
        setOtpExpiryCountdown(otpExpiryCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [otpExpiryCountdown]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;

    setIsResending(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "requestOTP", email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      // Start countdown timers
      setResendCountdown(RESEND_COOLDOWN);
      setOtpExpiryCountdown(OTP_EXPIRY_TIME);
      setMessage("OTP resent successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to resend OTP";
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Warm up the server to prevent cold start issues on Vercel
      try {
        console.log("🔥 Warming up server before OTP request...");
        const warmupResponse = await fetch("/api/warmup", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (warmupResponse.ok) {
          console.log("✅ Server warmed up successfully");
        } else {
          console.log("⚠️ Warm-up response not ok, but continuing...");
        }
      } catch (warmupError) {
        console.log(
          "⚠️ Warm-up failed, continuing with OTP request:",
          warmupError
        );
      }

      // Small delay to ensure server is ready
      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "requestOTP", email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error types
        if (response.status === 503) {
          throw new Error(
            "Service temporarily unavailable. Please try again in a moment."
          );
        } else if (response.status === 408) {
          throw new Error("Request timed out. Please try again.");
        } else if (response.status === 500 && data.error) {
          throw new Error(data.error);
        } else {
          throw new Error(data.error || "Failed to send OTP");
        }
      }

      setShowOtpInput(true);
      // Start countdown timers
      setResendCountdown(RESEND_COOLDOWN);
      setOtpExpiryCountdown(OTP_EXPIRY_TIME);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send OTP";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (otpExpiryCountdown === 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "verifyOTP", email, otp, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages
        const errorMessage = data.error || "Failed to verify OTP";

        // If OTP is invalid and we have attempts remaining, show helpful message
        if (
          errorMessage.includes("Wrong OTP") ||
          errorMessage.includes("attempts remaining")
        ) {
          setError(errorMessage);
        } else if (errorMessage.includes("Too many wrong attempts")) {
          setError("Too many wrong attempts. Please request a new OTP.");
          // Reset OTP input and expiry countdown
          setOtp("");
          setOtpExpiryCountdown(0);
        } else {
          setError(errorMessage);
        }
        return;
      }

      // Store tokens in localStorage (in production, use secure storage)
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken || "");
      localStorage.setItem("user", JSON.stringify(data.user));

      // Console log the token for debugging
      console.log("🔐 Login successful!");
      console.log("📧 User email:", data.user.email);
      console.log("👤 User role:", data.user.role);
      console.log("🏪 Tenant:", data.user.tenant?.name || "N/A");
      console.log("🔑 Token:", data.token);
      console.log("📝 Full user data:", data.user);

      // Show token expiration info
      const tokenInfo = tokenManager.getTokenInfo();
      if (tokenInfo) {
        console.log(
          "⏰ Token expires in:",
          Math.round(tokenInfo.expiresIn / 3600),
          "hours"
        );
        console.log("📅 Remember Me:", tokenInfo.isRememberMe ? "Yes" : "No");
        console.log("🕐 Expires at:", tokenInfo.expiresAt.toLocaleString());
      }

      // Redirect to dashboard
      router.push("/dashboard/staff");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid OTP";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header with Logo and Text */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Image
                src="/icon.png"
                alt="TapTab Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-black">TapTab</h1>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">
              Sign in to your account
            </h2>
            <p className="text-gray-600">Access your restaurant dashboard</p>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-gray-100 border border-gray-200 rounded-lg">
              <p className="text-black text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-gray-100 border border-gray-200 rounded-lg">
              <p className="text-black text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
                  placeholder="Enter your email"
                  disabled={showOtpInput}
                />
              </div>
            </div>

            {!showOtpInput ? (
              <Button
                onClick={handleRequestOTP}
                disabled={isLoading}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium"
              >
                {isLoading ? "Sending..." : "Send Login Code"}
              </Button>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-black mb-2"
                  >
                    Enter 6-digit code
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-center text-lg tracking-widest text-black placeholder-gray-500"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      We&apos;ve sent a 6-digit code to {email}
                    </p>

                    {/* OTP Expiry Countdown */}
                    {otpExpiryCountdown > 0 && (
                      <div className="flex items-center justify-center space-x-1 text-xs">
                        <Clock className="h-3 w-3 text-orange-500" />
                        <span
                          className={`font-medium ${
                            otpExpiryCountdown < 60
                              ? "text-red-600"
                              : otpExpiryCountdown < 120
                              ? "text-orange-600"
                              : "text-blue-600"
                          }`}
                        >
                          OTP expires in {formatTime(otpExpiryCountdown)}
                        </span>
                      </div>
                    )}

                    {/* OTP Expired Warning */}
                    {otpExpiryCountdown === 0 && showOtpInput && (
                      <div className="flex items-center justify-center space-x-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <span className="font-medium">
                          OTP has expired. Please request a new one.
                        </span>
                      </div>
                    )}

                    {/* Resend Countdown */}
                    {resendCountdown > 0 && (
                      <div className="flex items-center justify-center space-x-1 text-xs text-blue-600">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">
                          Resend available in {resendCountdown}s
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={
                      isLoading || otp.length !== 6 || otpExpiryCountdown === 0
                    }
                    className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    {isLoading
                      ? "Verifying..."
                      : otpExpiryCountdown === 0
                      ? "OTP Expired"
                      : "Sign In"}
                  </Button>

                  <Button
                    onClick={handleResendOTP}
                    disabled={resendCountdown > 0 || isResending}
                    variant="outline"
                    className="w-full !text-white border-gray-400 text-black hover:bg-gray-50 hover:!text-black disabled:opacity-50"
                  >
                    {isResending
                      ? "Resending..."
                      : resendCountdown > 0
                      ? `Resend in ${resendCountdown}s`
                      : otpExpiryCountdown === 0
                      ? "Request New OTP"
                      : "Resend OTP"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtpInput(false);
                        setOtp("");
                        setError("");
                        setMessage("");
                        setResendCountdown(0);
                      }}
                      className="text-sm text-gray-600 hover:text-black underline"
                    >
                      Back to Email
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="text-black hover:text-gray-700 font-medium"
              >
                Create restaurant account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
