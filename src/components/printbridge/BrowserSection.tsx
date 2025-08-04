'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function PrintBridgeBrowserSection() {
  const handleImageClick = () => {
    window.open('https://zentra-mu-flax.vercel.app/', '_blank');
  };

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
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
            The Local Print Solution That Changes Everything
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Zentra (our Node.js for macOS and .NET for Windows app) connects your web dashboard to any USB printer, bypassing browser limitations entirely. WebSocket bridge, USB auto-discovery, silent printing—trusted by 500+ kitchens, printing 1000s of labels daily.
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {/* Browser Frame */}
          <div 
            className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-4xl cursor-pointer hover:shadow-3xl transition-shadow duration-300"
            onClick={handleImageClick}
          >
            {/* Browser Title Bar */}
            <div className="bg-gray-100 rounded-t-lg px-4 py-3 flex items-center justify-between border-b border-gray-300">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span className="text-sm text-gray-600">PrintBridge Technology</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>

            {/* Browser Address Bar */}
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600 border border-gray-300">
                  instalabel.co/printbridge
                </div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>

            {/* Browser Content Area */}
            <div className="p-0">
              <Image
                src="/printbridge.png"
                alt="PrintBridge Technology"
                width={1200}
                height={800}
                className="w-full h-auto rounded-b-lg"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 