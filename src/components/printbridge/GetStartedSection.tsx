'use client';

import { motion } from 'framer-motion';


export default function PrintBridgeGetStartedSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-semibold text-black mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of businesses that have transformed their printing workflow with PrintBridge.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">1</span>
            </div>
            <h3 className="text-xl font-semibold text-black mb-4">Download Zentra</h3>
            <p className="text-gray-600">
              Get the lightweight native app for your operating system. Available for Windows and macOS.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">2</span>
            </div>
            <h3 className="text-xl font-semibold text-black mb-4">Connect Printer</h3>
            <p className="text-gray-600">
              Zentra automatically detects your thermal printers. No complex setup required.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">3</span>
            </div>
            <h3 className="text-xl font-semibold text-black mb-4">Start Printing</h3>
            <p className="text-gray-600">
              Integrate with your web app and enjoy instant, silent printing without popups.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <button className="bg-black text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors">
            Get Started Today
          </button>
        </motion.div>
      </div>
    </section>
  );
} 