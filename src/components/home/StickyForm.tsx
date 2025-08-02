'use client';

import { motion } from 'framer-motion';

export default function StickyForm() {
  return (
    <motion.div 
      className="w-1/2 bg-white   sticky top-0 h-screen max-h-screen z-10 flex flex-col overflow-hidden"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-md">
          <form className="flex flex-col space-y-3">
            <div>
              <label className="block text-base font-medium text-black mb-1">Full Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
                placeholder="Full name"
              />
            </div>
            
            <div>
              <label className="block text-base font-medium text-black mb-1">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
                placeholder="Email address"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-base font-medium text-black mb-1">Restaurant Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
                  placeholder="Restaurant name"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-black mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500"
                  placeholder="Phone number"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-base font-medium text-black mb-1">Preferred Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              />
            </div>
            
            <div>
              <label className="block text-base font-medium text-black mb-1">Message (Optional)</label>
              <textarea 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black placeholder-gray-500 resize-none"
                rows={1}
                placeholder="Tell us about your restaurant needs..."
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-[#FF4B30] hover:bg-[#E63E29] text-white py-4 rounded-lg font-medium text-lg transition-all duration-200"
            >
              Book Demo
            </button>
          </form>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            By booking a demo, you agree to our terms and privacy policy
          </p>
        </div>
      </div>
    </motion.div>
  );
} 