'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Printer } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksSection() {
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
            How It Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Three simple steps to transform your restaurant operations
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-12">
          {/* Step 1: Order */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-black">1</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Order</h3>
            <p className="text-gray-300 max-w-xs">
              Customers scan QR codes or staff takes orders on tablets. Everything syncs instantly.
            </p>
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <ArrowRight className="h-8 w-8 text-white" />
          </motion.div>

          {/* Step 2: Process */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-black">2</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Process</h3>
            <p className="text-gray-300 max-w-xs">
              Kitchen receives orders automatically. Print receipts instantly with PrintBridge.
            </p>
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <ArrowRight className="h-8 w-8 text-white" />
          </motion.div>

          {/* Step 3: Manage */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-black">3</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Manage</h3>
            <p className="text-gray-300 max-w-xs">
              View reports, analyze performance, and grow your business with real-time insights.
            </p>
          </motion.div>
        </div>

        {/* PrintBridge Highlight */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          viewport={{ once: true }}
        >
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
                <Printer className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white">PrintBridge Technology</h3>
            </div>
            <p className="text-gray-300 text-lg mb-6">
              TapTab includes <span className="text-white font-semibold">PrintBridge</span> - our local printing solution that bypasses browser limitations. 
              Print receipts directly to USB printers without popups or confusion.
            </p>
            <Link href="/printbridge">
              <motion.button
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 