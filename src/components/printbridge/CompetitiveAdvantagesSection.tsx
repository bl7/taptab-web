'use client';

import { motion } from 'framer-motion';
import { Monitor, Cloud, Hand, Printer } from 'lucide-react';

export default function PrintBridgeCompetitiveAdvantagesSection() {
  return (
    <section className="min-h-screen py-16 bg-white flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-semibold text-black mb-6">
            Competitive Advantages
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
            Zentra PrintBridge outperforms browser, cloud, and manual printing solutions—delivering speed, reliability, and peace of mind for your business.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-4">Browser Printing</h3>
            <ul className="space-y-2 text-sm text-black">
              <li>• Popups, confusion, wrong settings</li>
              <li>• Users select the wrong printer</li>
              <li>• Blocked by browser security</li>
              <li>• 23% error rate, 6+ clicks</li>
              <li>• Frustration, wasted time, support tickets</li>
            </ul>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-4">Cloud Printing</h3>
            <ul className="space-y-2 text-sm text-black">
              <li>• Requires internet connection</li>
              <li>• Monthly fees, data transmission</li>
              <li>• Complex setup, privacy concerns</li>
              <li>• Not truly local or instant</li>
              <li>• Dependency, cost, privacy risk</li>
            </ul>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <Hand className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-4">Manual Solutions</h3>
            <ul className="space-y-2 text-sm text-black">
              <li>• Training needed, user error</li>
              <li>• Manual file downloads</li>
              <li>• No automation, slow process</li>
              <li>• Ongoing maintenance</li>
              <li>• Inefficiency, mistakes, lost productivity</li>
            </ul>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <Printer className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-4">Zentra PrintBridge</h3>
            <ul className="space-y-2 text-sm text-black">
              <li>• No popups, no confusion</li>
              <li>• Silent, local, secure printing</li>
              <li>• Works offline, no cloud required</li>
              <li>• Instant, error-free label printing</li>
              <li>• Speed, reliability, happy users</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 