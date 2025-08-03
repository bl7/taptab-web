'use client';

import { motion } from 'framer-motion';
import { Gift, Plug, MessageCircle } from 'lucide-react';

export default function PrintBridgeGetStartedSection() {
  return (
    <section className="min-h-screen py-16 bg-gray-50 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-semibold text-black mb-6">
            Choose Your Path
          </h2>
          <p className="text-xl text-black max-w-4xl mx-auto leading-relaxed">
            PrintBridge is included with every TapTab account. Whether you&apos;re new or already a customer, pick the option that fits you best.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-4">Start Free Trial</h3>
            <p className="text-black mb-6">Try TapTab with Zentra PrintBridge included. No credit card required.</p>
            <button className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Start Free Trial
            </button>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <Plug className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-4">Enable Zentra PrintBridge</h3>
            <p className="text-black mb-6">Already using TapTab? Download Zentra from your dashboard to enable PrintBridge.</p>
            <button className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Enable Zentra
            </button>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-4">Talk to Sales</h3>
            <p className="text-black mb-6">Having trouble integrating Zentra PrintBridge? Our team is here to help.</p>
            <button className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Contact Sales
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 