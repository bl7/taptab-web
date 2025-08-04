'use client';

import { motion } from 'framer-motion';
import { Download, Wifi, Globe, Printer } from 'lucide-react';

export default function PrintBridgeSolutionSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Lines */}
            <div className="hidden lg:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gray-300"></div>
            <div className="hidden lg:block absolute top-16 left-1/2 right-1/4 h-0.5 bg-gray-300"></div>
            <div className="hidden lg:block absolute top-16 left-3/4 right-1/4 h-0.5 bg-gray-300"></div>

            {[
              {
                number: "1",
                icon: Download,
                title: "Download Zentra",
                description: "Download Zentra, our lightweight local bridge app, to your computer or server. It's a small, secure application that runs in the background and powers PrintBridge."
              },
              {
                number: "2",
                icon: Wifi,
                title: "Connect to Printer",
                description: "Zentra automatically detects and connects to your thermal printers. No complex network configuration required—it just works."
              },
              {
                number: "3",
                icon: Globe,
                title: "Use Web Dashboard",
                description: "Access your TapTab dashboard from any browser. Create labels, manage inventory, and track expiry dates with our intuitive interface."
              },
              {
                number: "4",
                icon: Printer,
                title: "Print Instantly",
                description: "When you click print, Zentra receives the command and sends it directly to your thermal printer. Labels print in seconds—this is the PrintBridge experience."
              }
            ].map((step, index) => (
              <motion.div
                key={step.number}
                className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 text-center relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Black Circle with Number */}
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="mb-4">
                  <step.icon className="h-8 w-8 text-black mx-auto" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-black mb-3">{step.title}</h3>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Features */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm text-black font-medium">No cloud dependencies</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm text-black font-medium">Works offline</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm text-black font-medium">Automatic reconnection</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 