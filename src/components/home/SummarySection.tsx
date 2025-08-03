'use client';

import { motion } from 'framer-motion';
import { Monitor, CreditCard, Package, BarChart3 } from 'lucide-react';

export default function SummarySection() {
  const features = [
    {
      icon: Monitor,
      title: "Real-time order management and kitchen display",
      description: "Orders flow instantly from POS to kitchen screens with clear instructions and timing."
    },
    {
      icon: CreditCard,
      title: "Integrated payment processing",
      description: "Accept cards, contactless, mobile payments—all in one seamless system."
    },
    {
      icon: Package,
      title: "Live inventory tracking and low-stock alerts",
      description: "Never run out of ingredients. Get notified before items are out of stock."
    },
    {
      icon: BarChart3,
      title: "Cloud-based reporting across all locations",
      description: "Access sales data, analytics, and reports from anywhere, anytime."
    }
  ];

  return (
    <section className="min-h-screen py-16 bg-black flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-semibold text-white mb-6">
            Complete Restaurant Management in One System
          </h2>
          <p className="text-xl text-white max-w-4xl mx-auto leading-relaxed">
            Transform your restaurant operations with TapTab—trusted by 1,000+ restaurants 
            for seamless ordering, payments, and kitchen coordination.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="flex items-start space-x-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-6 w-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 