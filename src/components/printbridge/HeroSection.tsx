'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Image from 'next/image';

export default function PrintBridgeHeroSection() {
  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* PrintBridge Logo */}
          <motion.div
            className="mb-8 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Image
              src="/printbridge-white.png"
              alt="PrintBridge Logo"
              width={300}
              height={150}
              className="h-32 w-auto"
              priority
            />
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-6xl font-light text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="block mb-2">No More Print Popups</div>
          
          </motion.h1>
          <motion.p 
            className="text-xl text-[#CCCCCC] max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            PrintBridge ends browser print dialog frustration.
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