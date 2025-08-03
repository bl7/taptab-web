'use client';

import { motion } from 'framer-motion';

export default function PrintBridgeProblemSection() {
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
            Every Web App Has the Same Printing Problem
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="text-left"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <ul className="space-y-4 text-lg text-black">
                <li className="flex items-start">
                  <span className="text-black mr-3 text-xl">•</span>
                  Wrong printer selected
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-3 text-xl">•</span>
                  Confused users, popup blockers
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-3 text-xl">•</span>
                  Wasted time, support tickets
                </li>
              </ul>
              <motion.div 
                className="mt-8 p-6 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <p className="text-lg font-semibold text-black mb-2">
                  Average print job: 6 clicks, 15 seconds, 23% error rate
                </p>
                <p className="text-black">
                  Web browsers can&apos;t talk to USB printers. Until now.
                </p>
              </motion.div>
            </motion.div>
            <motion.div 
              className="bg-gray-100 rounded-lg p-8"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Print</span>
                  <span className="text-sm text-gray-500">Select Printer: HP LaserJet (Offline)</span>
                </div>
                <div className="text-center py-8">
                  <div className="text-black text-4xl mb-2">✗</div>
                  <p className="text-black font-semibold">Wrong printer? Confused? Popup blocked?</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 