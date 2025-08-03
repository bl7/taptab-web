'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Monitor, Network, Lock, RefreshCw } from 'lucide-react';

export default function PrintBridgeTechnicalSpecsSection() {
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
            Technical Specifications
          </h2>
          <p className="text-xl text-black max-w-4xl mx-auto leading-relaxed">
            Native Node.js and .NET apps, WebSocket communication, USB driver integration, enterprise-grade security.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-black mb-6">Architecture</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <span className="font-semibold text-black">Web App</span>
                <ArrowRight className="h-5 w-5 text-black" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <span className="font-semibold text-black">PrintBridge</span>
                <ArrowRight className="h-5 w-5 text-black" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <span className="font-semibold text-black">Thermal Printer</span>
                <Check className="h-5 w-5 text-black" />
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-3">Native Apps</h3>
              <p className="text-sm text-black">Real Node.js (macOS) and .NET (Windows) applications—not browser extensions.</p>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Network className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-3">Architecture</h3>
              <p className="text-sm text-black">WebSocket communication, USB driver integration, auto-discovery protocols.</p>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-3">Security</h3>
              <p className="text-sm text-black">All local processing, zero external dependencies, enterprise-grade security.</p>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <RefreshCw className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-3">Reliability</h3>
              <p className="text-sm text-black">Self-healing connections, automatic updates, 99.9% uptime.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
} 