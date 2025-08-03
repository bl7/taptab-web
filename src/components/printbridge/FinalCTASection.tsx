'use client';

import { motion } from 'framer-motion';
import { Star, Box, CreditCard } from 'lucide-react';

export default function PrintBridgeFinalCTASection() {
  return (
    <section className="min-h-screen py-16 bg-black flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Ready to simplify your kitchen labeling?
          </h2>
          <p className="text-xl text-white mb-12 max-w-3xl mx-auto leading-relaxed">
            LHD-compliant labels. National&apos;s Law ready. No training required. Works seamlessly with your existing Epson printer and Sunmi devices.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <Box className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Order Labels Directly</h3>
              <p className="text-sm text-black">Order labels from the dashboard</p>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Print Instantly</h3>
              <p className="text-sm text-black">Print labels for orders</p>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Secure Payment</h3>
              <p className="text-sm text-black">Secure payments</p>
            </motion.div>
          </div>

          <motion.div 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="h-5 w-5 text-black fill-current" />
              ))}
            </div>
            <p className="text-black italic mb-4">
              &ldquo;TapTab changed the way our kitchen runs. We&apos;re more compliant, more efficient, and wasting less.&rdquo;
            </p>
            <p className="text-black font-semibold">- Head Chef, Local Deli Group</p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button 
              className="bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free Trial
            </motion.button>
            <motion.button 
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-black transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 