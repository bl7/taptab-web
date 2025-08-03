'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function StickyForm() {
  return (
    <div className="w-1/2 bg-gray-50 sticky top-0 h-screen flex items-center justify-center p-8">
      <motion.div 
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h2 className="text-2xl font-semibold text-black mb-2">
            Get Started Today
          </h2>
          <p className="text-black text-sm">
            Join 1,000+ restaurants already using TapTab
          </p>
        </motion.div>

        <motion.form 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Your restaurant name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <motion.button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-4 w-4" />
          </motion.button>
        </motion.form>

        <motion.div 
          className="mt-6 text-center text-xs text-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          No credit card required • 14-day free trial
        </motion.div>
      </motion.div>
    </div>
  );
} 