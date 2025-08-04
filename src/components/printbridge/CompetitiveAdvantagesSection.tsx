'use client';

import { motion } from 'framer-motion';
import { X, Cloud, Settings, Shield } from 'lucide-react';

export default function PrintBridgeCompetitiveAdvantagesSection() {
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
            Competitive Advantages
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
            Zentra PrintBridge outperforms browser, cloud, and manual printing solutions—delivering speed, reliability, and peace of mind for your business.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Browser Printing */}
          <motion.div
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-4">Browser Printing</h3>
            <ul className="space-y-2 text-sm text-black mb-4 text-left">
              <li>• Popups, confusion, wrong settings</li>
              <li>• Users select the wrong printer</li>
              <li>• Blocked by browser security</li>
              <li>• 23% error rate, 6+ clicks</li>
            </ul>
            <p className="text-sm text-gray-600 font-medium">Frustration, wasted time, support tickets</p>
          </motion.div>

          {/* Cloud Printing */}
          <motion.div
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-4">Cloud Printing</h3>
            <ul className="space-y-2 text-sm text-black mb-4 text-left">
              <li>• Requires internet connection</li>
              <li>• Monthly fees, data transmission</li>
              <li>• Complex setup, privacy concerns</li>
              <li>• Not truly local or instant</li>
            </ul>
            <p className="text-sm text-gray-600 font-medium">Dependency, cost, privacy risk</p>
          </motion.div>

          {/* Manual Solutions */}
          <motion.div
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-4">Manual Solutions</h3>
            <ul className="space-y-2 text-sm text-black mb-4 text-left">
              <li>• Training needed, user error</li>
              <li>• Manual file downloads</li>
              <li>• No automation, slow process</li>
              <li>• Ongoing maintenance</li>
            </ul>
            <p className="text-sm text-gray-600 font-medium">Inefficiency, mistakes, lost productivity</p>
          </motion.div>

          {/* Zentra PrintBridge */}
          <motion.div
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-4">Zentra PrintBridge</h3>
            <ul className="space-y-2 text-sm text-black mb-4 text-left">
              <li>• No popups, no confusion</li>
              <li>• Silent, local, secure printing</li>
              <li>• Works offline, no cloud required</li>
              <li>• Instant, error-free label printing</li>
            </ul>
            <p className="text-sm text-gray-600 font-medium">Speed, reliability, happy users</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 