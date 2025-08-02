'use client';

export default function StickyForm() {
  return (
    <div className="w-1/2 bg-gray-50 p-6">
      <div className="sticky top-6">
        <h2 className="text-2xl font-bold text-black mb-4">
          Get Started
        </h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your restaurant name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
} 