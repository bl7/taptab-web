'use client';

import { motion } from 'framer-motion';
import { X, Check, AlertTriangle } from 'lucide-react';

export default function ProblemSection() {
  return (
    <section className="h-screen bg-white flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Old POS Thinking vs Modern Restaurant Reality
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Traditional POS Problems */}
          <motion.div
            className="bg-red-50 rounded-2xl p-8 border border-red-200"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <h3 className="text-2xl font-semibold text-black">Traditional POS Systems</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <p className="text-black">Payment processing with basic add-ons</p>
              </div>
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <p className="text-black">Separate apps for scheduling, delivery, printing</p>
              </div>
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <p className="text-black">Staff juggling 5 different logins</p>
              </div>
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                <p className="text-black">Data trapped in silos</p>
              </div>
            </div>
          </motion.div>

          {/* Modern Restaurant Needs */}
          <motion.div
            className="bg-green-50 rounded-2xl p-8 border border-green-200"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Check className="w-8 h-8 text-green-600" />
              <h3 className="text-2xl font-semibold text-black">Modern Restaurant Needs</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-black">Orders flow seamlessly from QR to kitchen</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-black">Staff schedules adapt to real sales data</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-black">Delivery apps integrate with your POS</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-black">One system that actually talks to itself</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 