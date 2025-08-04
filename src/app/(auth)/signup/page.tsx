'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    // Restaurant details
    restaurantName: '',
    restaurantSlug: '',
    restaurantAddress: '',
    restaurantPhone: '',
    
    // Admin user details
    firstName: '',
    lastName: '',
    email: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Redirect to login with success message
      router.push('/login?message=Restaurant account created successfully! Please check your email for login instructions.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-2xl">
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
            <h2 className="text-3xl font-bold text-black mb-2">Create Restaurant Account</h2>
            <p className="text-gray-600">Set up your restaurant on TapTab POS</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gray-100 border border-gray-200 rounded-lg">
              <p className="text-black text-sm">{error}</p>
            </div>
          )}

          <form 
            onSubmit={handleSubmit} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="space-y-6"
          >
            {/* Restaurant Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-black mb-4">Restaurant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="restaurantName" className="block text-sm font-medium text-black mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    id="restaurantName"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
                    placeholder="Enter restaurant name"
                  />
                </div>

                <div>
                  <label htmlFor="restaurantSlug" className="block text-sm font-medium text-black mb-2">
                    Restaurant Slug *
                  </label>
                  <input
                    type="text"
                    id="restaurantSlug"
                    name="restaurantSlug"
                    value={formData.restaurantSlug}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
                    placeholder="restaurant-name"
                  />
                </div>

                <div>
                  <label htmlFor="restaurantPhone" className="block text-sm font-medium text-black mb-2">
                    Restaurant Phone
                  </label>
                  <input
                    type="tel"
                    id="restaurantPhone"
                    name="restaurantPhone"
                    value={formData.restaurantPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
                    placeholder="+1234567890"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="restaurantAddress" className="block text-sm font-medium text-black mb-2">
                    Restaurant Address
                  </label>
                  <input
                    type="text"
                    id="restaurantAddress"
                    name="restaurantAddress"
                    value={formData.restaurantAddress}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
              </div>
            </div>

            {/* Admin User Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-black mb-4">Admin Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-black mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-black mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
                    placeholder="Enter last name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
                    placeholder="admin@restaurant.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This email will be used for login and receiving OTP codes
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium"
            >
              {isLoading ? 'Creating Account...' : 'Create Restaurant Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-black hover:text-gray-700 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 