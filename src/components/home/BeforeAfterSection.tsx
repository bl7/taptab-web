'use client';

import { motion } from 'framer-motion';
import { X, Check, Clock, Zap, Receipt, Smartphone } from 'lucide-react';

export default function BeforeAfterSection() {
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
            Before vs After
          </h2>
          <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
            See the transformation from chaotic paper systems to streamlined digital operations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Before */}
          <motion.div 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-black mb-2">Before</h3>
              <p className="text-black font-medium text-sm">Chaotic & Slow</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <X className="h-4 w-4 text-black" />
                <span className="text-sm text-black">Paper tickets getting lost</span>
              </div>
              <div className="flex items-center space-x-3">
                <X className="h-4 w-4 text-black" />
                <span className="text-sm text-black">Slow cash register transactions</span>
              </div>
              <div className="flex items-center space-x-3">
                <X className="h-4 w-4 text-black" />
                <span className="text-sm text-black">Manual inventory tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <X className="h-4 w-4 text-black" />
                <span className="text-sm text-black">No real-time reporting</span>
              </div>
              <div className="flex items-center space-x-3">
                <X className="h-4 w-4 text-black" />
                <span className="text-sm text-black">Kitchen communication chaos</span>
              </div>
              <div className="flex items-center space-x-3">
                <X className="h-4 w-4 text-black" />
                <span className="text-sm text-black">Long customer wait times</span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-4 w-4 text-black" />
                <span className="text-black font-medium text-sm">5+ minute order processing</span>
              </div>
            </div>
          </motion.div>

          {/* After */}
          <motion.div 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-black mb-2">After</h3>
              <p className="text-black font-medium text-sm">Streamlined & Fast</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Check className="h-4 w-4 text-black" />
                <span className="text-sm text-black">Digital orders with instant delivery</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-4 w-4 text-black" />
                <span className="text-sm text-black">Lightning-fast contactless payments</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-4 w-4 text-black" />
                <span className="text-sm text-black">Automated inventory management</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-4 w-4 text-black" />
                <span className="text-sm text-black">Real-time analytics dashboard</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-4 w-4 text-black" />
                <span className="text-sm text-black">Seamless kitchen coordination</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="h-4 w-4 text-black" />
                <span className="text-sm text-black">Faster table turnover</span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <Zap className="h-4 w-4 text-black" />
                <span className="text-black font-medium text-sm">30-second order processing</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Visual Elements */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-6 w-6 text-black" />
            </div>
            <h4 className="font-semibold text-white mb-2 text-sm">Paper Tickets</h4>
            <p className="text-white text-xs">Lost, damaged, hard to read</p>
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-6 w-6 text-black" />
            </div>
            <h4 className="font-semibold text-white mb-2 text-sm">Digital Orders</h4>
            <p className="text-white text-xs">Instant, clear, trackable</p>
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-black" />
            </div>
            <h4 className="font-semibold text-white mb-2 text-sm">Fast Checkout</h4>
            <p className="text-white text-xs">Contactless, secure, instant</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 