'use client';

import { motion } from 'framer-motion';
import { QrCode, Printer, Users, Truck } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="h-screen bg-black flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-light text-white mb-6">
            <div className="block mb-2">Restaurant POS</div>
            <div className="block">Reimagined</div>
          </h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            QR ordering, kitchen printing, staff scheduling, and delivery integration.
            <br />
            Everything your modern restaurant needs in one powerful system.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.button 
              className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free Trial
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Feature Icons */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-black" />
            </div>
            <p className="text-white text-sm">QR Ordering</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
              <Printer className="w-8 h-8 text-black" />
            </div>
            <p className="text-white text-sm">Kitchen Printing</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-black" />
            </div>
            <p className="text-white text-sm">Staff Scheduling</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-black" />
            </div>
            <p className="text-white text-sm">Delivery Integration</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 