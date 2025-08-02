'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import Image from 'next/image';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const successMessage = searchParams.get('message');
    if (successMessage) {
      setMessage(successMessage);
    }
  }, [searchParams]);

  const handleRequestOTP = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'requestOTP', email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      setShowOtpInput(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'verifyOTP', email, otp }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }
      
      // Store tokens in localStorage (in production, use secure storage)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Console log the token for debugging
      console.log('🔐 Login successful!');
      console.log('📧 User email:', data.user.email);
      console.log('👤 User role:', data.user.role);
      console.log('🏪 Tenant:', data.user.tenant?.name || 'N/A');
      console.log('🔑 Token:', data.token);
      console.log('📝 Full user data:', data.user);
      
      // Redirect to dashboard
      router.push('/dashboard/staff');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
              <h1 className="text-2xl font-bold text-[#1A1A1A]">TapTab</h1>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">Sign in to your account</h2>
            <p className="text-[#4A4A4A]">Access your restaurant dashboard</p>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4A4A4A] h-5 w-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4B30] focus:border-transparent text-black placeholder-[#4A4A4A]"
                  placeholder="Enter your email"
                  disabled={showOtpInput}
                />
              </div>
            </div>

            {!showOtpInput ? (
              <Button
                onClick={handleRequestOTP}
                disabled={isLoading}
                className="w-full bg-[#FF4B30] hover:bg-[#E63E29] text-white py-3 rounded-lg font-medium"
              >
                {isLoading ? 'Sending...' : 'Send Login Code'}
              </Button>
            ) : (
              <>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Enter 6-digit code
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4A4A4A] h-5 w-5" />
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4B30] focus:border-transparent text-center text-lg tracking-widest text-black placeholder-[#4A4A4A]"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-xs text-[#4A4A4A] mt-1">
                    We&apos;ve sent a 6-digit code to {email}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-[#FF4B30] hover:bg-[#E63E29] text-white py-3 rounded-lg font-medium"
                  >
                    {isLoading ? 'Verifying...' : 'Sign In'}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setShowOtpInput(false);
                      setOtp('');
                      setError('');
                    }}
                    variant="outline"
                    className="w-full border-gray-400 text-black hover:bg-gray-50"
                  >
                    Back to Email
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#4A4A4A]">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-[#267DF4] hover:text-[#1E90FF] font-medium">
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