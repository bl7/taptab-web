'use client';

import { motion } from 'framer-motion';
import { Zap, Users, Shield, TrendingUp } from 'lucide-react';

export default function SolutionSection() {
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
            TapTab was designed for restaurants from day one
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built by restaurant owners, for restaurant owners. Every feature serves your business.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
            <p className="text-gray-300">Orders processed in seconds, not minutes</p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Staff Friendly</h3>
            <p className="text-gray-300">Intuitive design that anyone can learn</p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Reliable</h3>
            <p className="text-gray-300">99.9% uptime, always there when you need it</p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Growth Ready</h3>
            <p className="text-gray-300">Scales with your business, no limits</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 