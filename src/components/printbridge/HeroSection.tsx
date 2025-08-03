'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function PrintBridgeHeroSection() {
  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-light text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="block mb-2">No More Print Popups</div>
            <div className="block">PrintBridge ends browser print dialog frustration</div>
          </motion.h1>
          <motion.p 
            className="text-xl text-[#CCCCCC] max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            PrintBridge is TapTab&apos;s seamless local printing solution, powered by Zentra—our lightweight bridge app for Windows and Mac. Connect your web dashboard directly to your thermal printers for instant, reliable printing.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-[#CCCCCC] mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-white" />
              <span className="text-sm">Works with any thermal printer</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-white" />
              <span className="text-sm">No internet required for printing</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2 text-white" />
              <span className="text-sm">Automatic reconnection</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 