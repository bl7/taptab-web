'use client';

import { motion } from 'framer-motion';

export default function PrintBridgeSolutionSection() {
  return (
    <section className="min-h-screen py-16 bg-gray-50 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-semibold text-black mb-6">
            The Local Print Solution That Changes Everything
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
            Zentra (our Node.js for macOS and .NET for Windows app) connects your web dashboard to any USB printer, bypassing browser limitations entirely. WebSocket bridge, USB auto-discovery, silent printing—trusted by 500+ kitchens, printing 1000s of labels daily.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
            <motion.div 
              className="bg-gray-100 rounded-lg p-8"
              initial={{ opacity: 0, x: -30 }}
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
                  <div className="text-black text-4xl mb-2">✓</div>
                  <p className="text-black font-semibold">Label Printed!</p>
                  <p className="text-black text-sm mt-2">No popups. No confusion. Just done.</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="text-left"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold text-black mb-6">How It Works</h3>
              <div className="space-y-6">
                {[
                  {
                    number: "1",
                    title: "Download Zentra",
                    description: "Download Zentra, our lightweight local bridge app, to your computer or server. It's a small, secure application that runs in the background and powers PrintBridge."
                  },
                  {
                    number: "2",
                    title: "Connect to Printer",
                    description: "Zentra automatically detects and connects to your thermal printers. No complex network configuration required—it just works."
                  },
                  {
                    number: "3",
                    title: "Use Web Dashboard",
                    description: "Access your TapTab dashboard from any browser. Create labels, manage inventory, and track expiry dates with our intuitive interface."
                  },
                  {
                    number: "4",
                    title: "Print Instantly",
                    description: "When you click print, Zentra receives the command and sends it directly to your thermal printer. Labels print in seconds—this is the PrintBridge experience."
                  }
                ].map((step, index) => (
                  <motion.div 
                    key={step.number}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{step.number}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-2">{step.title}</h4>
                      <p className="text-black">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 