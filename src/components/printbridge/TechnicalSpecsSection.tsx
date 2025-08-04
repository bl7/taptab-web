'use client';

import { motion } from 'framer-motion';
import { Monitor, Network, Lock, RefreshCw, Wifi } from 'lucide-react';

export default function PrintBridgeTechnicalSpecsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Connection Diagram */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              {/* Dashboard - Larger and Horizontal */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-6 w-80">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Dashboard</span>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>

              {/* Connection Line */}
              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gray-400"></div>
              </div>

              {/* PrintBridge - Smaller and Black */}
              <div className="bg-black rounded-lg shadow-lg border border-gray-300 p-4 w-48 mx-auto">
                <div className="flex items-center justify-center mb-2">
                  <Wifi className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold text-sm">PrintBridge</div>
                  <div className="text-gray-300 text-xs">Connected</div>
                </div>
              </div>

              {/* Connection Line */}
              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gray-400"></div>
              </div>

              {/* Thermal Printer - Gray */}
              <div className="bg-gray-100 rounded-lg shadow-lg border border-gray-200 p-4 w-48 mx-auto">
                <div className="text-center">
                  <div className="text-gray-700 font-semibold text-sm">Thermal Printer</div>
                  <div className="text-gray-500 text-xs">Ready to Print</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Title, Text, and Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-semibold text-black mb-6">
              Technical Specifications
            </h2>
            <p className="text-xl text-black mb-8 leading-relaxed">
              Native Node.js and .NET apps, WebSocket communication, USB driver integration, enterprise-grade security.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="bg-white rounded-lg shadow-lg border border-gray-200 p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3">
                  <Monitor className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-black mb-2">Native Apps</h3>
                <p className="text-xs text-gray-600">Real Node.js (macOS) and .NET (Windows) applications—not browser extensions.</p>
              </motion.div>

              <motion.div 
                className="bg-white rounded-lg shadow-lg border border-gray-200 p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-black mb-2">Architecture</h3>
                <p className="text-xs text-gray-600">WebSocket communication, USB driver integration, auto-discovery protocols.</p>
              </motion.div>

              <motion.div 
                className="bg-white rounded-lg shadow-lg border border-gray-200 p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-black mb-2">Security</h3>
                <p className="text-xs text-gray-600">All local processing, zero external dependencies, enterprise-grade security.</p>
              </motion.div>

              <motion.div 
                className="bg-white rounded-lg shadow-lg border border-gray-200 p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3">
                  <RefreshCw className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-black mb-2">Reliability</h3>
                <p className="text-xs text-gray-600">Self-healing connections, automatic updates, 99.9% uptime.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 