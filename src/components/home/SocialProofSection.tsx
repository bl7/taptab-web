'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export default function SocialProofSection() {
  return (
    <section className="h-screen bg-black flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Built for Modern Restaurant Owners
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            &ldquo;Finally, restaurant technology that thinks like we do.&rdquo;
          </p>
          
          <div className="bg-gray-900 rounded-2xl p-8 max-w-4xl mx-auto mb-8">
            <Quote className="w-12 h-12 text-gray-400 mx-auto mb-6" />
            <p className="text-lg text-white leading-relaxed mb-6">
              Join forward-thinking restaurants already using TapTab to streamline their operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button 
                className="bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Request Early Access
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 