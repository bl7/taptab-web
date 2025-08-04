'use client';

import { motion } from 'framer-motion';
import { QrCode, Calendar, Printer, Truck } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: QrCode,
      title: "QR Ordering That Just Works",
      description: "Guests scan, order, pay. Kitchen gets tickets instantly. No apps to download.",
      category: "Ordering"
    },
    {
      icon: Calendar,
      title: "Smart Staff Scheduling",
      description: "Your rota system knows your busy periods. Schedule based on real data, not guesswork.",
      category: "Management"
    },
    {
      icon: Printer,
      title: "Seamless Kitchen Integration",
      description: "Orders print exactly where they need to go. No lost tickets, no confusion.",
      category: "Operations"
    },
    {
      icon: Truck,
      title: "Delivery Apps Connected",
      description: "Uber Eats and Deliveroo orders flow through the same system as dine-in orders.",
      category: "Integration"
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
            Built for How Modern Restaurants Actually Work
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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