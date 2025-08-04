'use client';

import { motion } from 'framer-motion';

export default function PrintBridgeProblemSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="text-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">
              Every Web App Has the Same Printing Problem
            </h2>
            <ul className="space-y-4 text-lg text-black mb-6">
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
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <p className="text-lg font-semibold text-black mb-2">
                Average print job: 6 clicks, 15 seconds, 23% error rate
              </p>
              <p className="text-black">
                Web browsers can&apos;t talk to USB printers. <span className="text-black font-semibold">Until now.</span>
              </p>
            </motion.div>
          </motion.div>
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {/* Print Dialog Box */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-300 w-96">
              {/* Title Bar */}
              <div className="bg-gray-100 rounded-t-lg px-4 py-2 flex items-center justify-between border-b border-gray-300">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-sm font-medium text-gray-700">Print</div>
                <div className="w-16"></div>
              </div>
              
              {/* Content Area */}
              <div className="p-6">
                {/* Content Placeholders */}
                <div className="space-y-3 mb-6">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
                
                {/* Printer Selection */}
                <div className="text-sm text-gray-600 mb-6">
                  Select Printer: HP LaserJet (Offline)
                </div>
                
                {/* Print Button */}
                <div className="flex justify-center mb-4">
                  <button className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                    Print
                  </button>
                </div>
                
                {/* Error Message */}
                <div className="text-xs text-red-600 text-center">
                  Wrong printer? Confused? Popup blocked?
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 