'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, Users, QrCode, Tablet, BarChart3 } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: QrCode,
      title: "QR Ordering",
      description: "Guests scan and order instantly - no app download required",
      category: "Speed"
    },
    {
      icon: Tablet,
      title: "Tablet POS",
      description: "Intuitive interface that staff love to use",
      category: "Ease"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Orders processed in seconds, not minutes",
      category: "Speed"
    },
    {
      icon: Shield,
      title: "Offline Mode",
      description: "Never lose sales, even when internet is down",
      category: "Reliability"
    },
    {
      icon: Users,
      title: "Staff Friendly",
      description: "Anyone can learn it in minutes, not days",
      category: "Ease"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track performance and grow your business",
      category: "Control"
    }
  ];

  return (
    <section className="h-screen bg-black flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything you need to succeed
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Six powerful features that transform how you run your restaurant
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-gray-900 rounded-lg border border-gray-700 p-6 hover:border-gray-500 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-black" />
              </div>
              <div className="mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wide">{feature.category}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 