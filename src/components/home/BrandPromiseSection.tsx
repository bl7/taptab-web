'use client';

import { motion } from 'framer-motion';
import { Zap, CreditCard, Brain } from 'lucide-react';

export default function BrandPromiseSection() {
  return (
    <section className="min-h-screen py-16 bg-black flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-semibold text-white mb-6">
            Order Faster. Pay Easier. Manage Smarter.
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-black mb-4">
                The Problem
              </h3>
              <p className="text-base text-black leading-relaxed">
                No more lost orders, slow checkouts, or kitchen confusion. 
                With TapTab, your restaurant runs like clockwork—from first order to last call.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-semibold text-black mb-4">
                The Solution
              </h3>
              <p className="text-base text-black leading-relaxed">
                Increase table turnover without the chaos. TapTab handles the complexity 
                so your staff can focus on hospitality and your kitchen can cook without interruption.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-white">Process orders in seconds, not minutes</p>
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Easy Payments</h3>
            <p className="text-white">Accept any payment method seamlessly</p>
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Management</h3>
            <p className="text-white">Real-time insights and automated workflows</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 