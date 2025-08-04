'use client';

import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

export default function ProblemSection() {
  return (
    <section className="h-screen bg-black flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Traditional systems weren't built for restaurants
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Legacy POS systems are slow, expensive, and make your staff's job harder.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Before Card */}
          <motion.div
            className="bg-gray-900 rounded-lg p-8 border border-gray-700"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4">
                <X className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Traditional POS</h3>
            </div>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start">
                <X className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                <span>Slow, clunky interfaces that frustrate staff</span>
              </li>
              <li className="flex items-start">
                <X className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                <span>Expensive hardware and monthly fees</span>
              </li>
              <li className="flex items-start">
                <X className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                <span>No QR ordering or modern features</span>
              </li>
              <li className="flex items-start">
                <X className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                <span>Complex setup and training required</span>
              </li>
            </ul>
          </motion.div>

          {/* After Card */}
          <motion.div
            className="bg-gray-900 rounded-lg p-8 border border-gray-700"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                <Check className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">TapTab POS</h3>
            </div>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                <span>Intuitive design that staff love to use</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                <span>Affordable pricing with no hidden fees</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                <span>QR ordering, tablets, and modern features</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                <span>Setup in minutes, not days</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 