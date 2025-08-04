'use client';

import { motion } from 'framer-motion';
import { Coffee, Wine, Utensils, Pizza } from 'lucide-react';

export default function UseCasesSection() {
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
            Perfect for any restaurant
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From cafes to fine dining, TapTab adapts to your business
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
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Coffee className="h-10 w-10 text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Cafes</h3>
            <p className="text-gray-300">Quick service, QR ordering, fast turnover</p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Wine className="h-10 w-10 text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Bars</h3>
            <p className="text-gray-300">Table service, drink orders, happy hour management</p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Utensils className="h-10 w-10 text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Restaurants</h3>
            <p className="text-gray-300">Full service, table management, kitchen coordination</p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Pizza className="h-10 w-10 text-black" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Cloud Kitchens</h3>
            <p className="text-gray-300">Delivery focus, order aggregation, kitchen efficiency</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 