'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Monitor, Printer, Zap, Shield } from 'lucide-react';

export default function PrintBridgeIntegrationSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
            Why TapTab + PrintBridge = 
            <span className="text-black font-semibold"> Superior POS</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your PC into a professional POS system with seamless local printing capabilities
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Instant Printing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white p-8 rounded-lg shadow-lg border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-full mr-4">
                <Zap className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Instant Printing</h3>
            </div>
            <p className="text-gray-600 mb-4">
              No more waiting for browser print dialogs. TapTab sends orders directly to your thermal printer through PrintBridge, ensuring immediate receipt printing.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-black mr-2" />
                Zero print dialog interruptions
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-black mr-2" />
                Sub-second printing response
              </li>
            </ul>
          </motion.div>

          {/* Professional POS Experience */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white p-8 rounded-lg shadow-lg border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-full mr-4">
                <Monitor className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Professional POS Experience</h3>
            </div>
            <p className="text-gray-600 mb-4">
              TapTab on PC with PrintBridge provides the same reliability and speed as dedicated POS systems, but with the flexibility of web-based management.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-black mr-2" />
                Desktop-grade performance
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-black mr-2" />
                Familiar web interface
              </li>
            </ul>
          </motion.div>

          {/* Offline Reliability */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white p-8 rounded-lg shadow-lg border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-full mr-4">
                <Shield className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Offline Reliability</h3>
            </div>
            <p className="text-gray-600 mb-4">
              PrintBridge works locally, ensuring your POS operations continue even when internet connectivity is unstable or unavailable.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-black mr-2" />
                Local printing network
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-black mr-2" />
                No internet dependency
              </li>
            </ul>
          </motion.div>

          {/* Cost Effective */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-white p-8 rounded-lg shadow-lg border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-full mr-4">
                <Printer className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Cost Effective</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Use your existing thermal printers and PC hardware. No need for expensive dedicated POS terminals or proprietary printing solutions.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-black mr-2" />
                Works with existing hardware
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-black mr-2" />
                No proprietary lock-in
              </li>
            </ul>
          </motion.div>

          {/* Seamless Integration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="bg-white p-8 rounded-lg shadow-lg border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-full mr-4">
                <Zap className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Seamless Integration</h3>
            </div>
            <p className="text-gray-600 mb-4">
              PrintBridge integrates transparently with TapTab. Your staff won't notice any difference - just faster, more reliable printing.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-black mr-2" />
                Zero learning curve
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-black mr-2" />
                Automatic reconnection
              </li>
            </ul>
          </motion.div>

          {/* Future Proof */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="bg-white p-8 rounded-lg shadow-lg border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-full mr-4">
                <Monitor className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Future Proof</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Built on open standards and web technologies. Your investment in TapTab + PrintBridge will continue to work as technology evolves.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-black mr-2" />
                Web-based architecture
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-black mr-2" />
                Regular updates and improvements
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-center mt-16"
        >
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Ready to Upgrade Your POS Experience?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of restaurants and retail businesses that have transformed their operations with TapTab + PrintBridge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Get Started Today
              </button>
              <button className="border border-black text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 