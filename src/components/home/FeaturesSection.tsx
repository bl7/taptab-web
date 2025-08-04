'use client';

import { motion } from 'framer-motion';
import { QrCode, Users, Printer, Truck } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: QrCode,
      title: "QR Ordering That Just Works",
      description: "Guests scan and order from their phones. No app downloads, no friction, just modern convenience.",
      category: "Ordering"
    },
    {
      icon: Users,
      title: "Smart Staff Scheduling",
      description: "Schedule based on actual sales data, not guesswork. Staff get schedules via email automatically.",
      category: "Management"
    },
    {
      icon: Printer,
      title: "Seamless Kitchen Integration",
      description: "Orders print automatically to your kitchen. No more lost tickets or misheard orders.",
      category: "Operations"
    },
    {
      icon: Truck,
      title: "Delivery Apps Connected",
      description: "Uber Eats, Deliveroo, Just Eat - all integrated. One system, all your orders.",
      category: "Integration"
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Built for How Modern Restaurants Actually Work
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Four powerful features that work together seamlessly. No more juggling multiple systems.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-colors"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {feature.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 