'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Cross, Truck, Factory } from 'lucide-react';

export default function PrintBridgeUseCasesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-black mb-6">
            Use Cases
          </h2>
          <p className="text-xl text-black max-w-4xl mx-auto leading-relaxed">
            Any web app that needs reliable USB printing—Zentra PrintBridge is ready.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div 
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-3">Retail</h3>
            <p className="text-sm text-gray-600">Price tags, shelf labels, receipt printing—reliable USB printing for any retail environment.</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
              <Cross className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-3">Healthcare</h3>
            <p className="text-sm text-gray-600">Patient labels, specimen tracking, prescription labels—secure, accurate, and fast.</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-3">Logistics</h3>
            <p className="text-sm text-gray-600">Shipping labels, inventory tags, warehouse management—no cloud dependency, always on.</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
              <Factory className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-3">Manufacturing</h3>
            <p className="text-sm text-gray-600">Product labels, quality control, compliance tracking—works with any USB printer.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 