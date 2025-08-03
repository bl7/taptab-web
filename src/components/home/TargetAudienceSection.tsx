'use client';

import { motion } from 'framer-motion';
import { Truck, Coffee, Utensils, Wine } from 'lucide-react';

export default function TargetAudienceSection() {
  const restaurantTypes = [
    {
      icon: Truck,
      title: "Food Trucks",
      description: "Mobile POS that works anywhere. Accept payments on the go."
    },
    {
      icon: Coffee,
      title: "Cafés & Coffee Shops",
      description: "Quick service with detailed customization options for drinks."
    },
    {
      icon: Utensils,
      title: "Casual Dining",
      description: "Full-service restaurants with table management and split bills."
    },
    {
      icon: Wine,
      title: "Fine Dining",
      description: "Elegant service with wine pairing and course management."
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
            Built for Every Restaurant
          </h2>
          <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
            From food trucks to fine dining, TapTab scales with your business needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {restaurantTypes.map((type, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                <type.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                {type.title}
              </h3>
              <p className="text-black leading-relaxed">
                {type.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 