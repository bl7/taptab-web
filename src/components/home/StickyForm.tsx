'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function StickyForm() {
  return (
    <div className="w-2/5 bg-gray-50 sticky top-0 h-screen flex items-center justify-center p-8 overflow-hidden">
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
          <h2 className="text-3xl font-bold text-black mb-4">
            Book a Free Demo
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            See TapTab in action and transform your restaurant
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="Your restaurant name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <motion.button
            type="submit"
            className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center justify-center text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Book Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.button>
        </motion.form>

        <motion.div 
          className="mt-6 text-center text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          No credit card required • 14-day free trial • Setup in minutes
        </motion.div>

        {/* Scroll Cue */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Scroll to learn more</span>
          </div>
          <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 