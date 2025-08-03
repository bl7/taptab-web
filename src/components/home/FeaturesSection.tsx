'use client';

import { motion } from 'framer-motion';
import { QrCode, Tablet, Printer, BarChart3, Smartphone, Shield } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: QrCode,
      title: "QR Code Ordering",
      description: "Guests scan and order instantly from their phones - no app download required",
      benefits: [
        "No app downloads required",
        "Instant menu access", 
        "Customizable orders",
        "Real-time updates"
      ]
    },
    {
      icon: Tablet,
      title: "Tablet POS System",
      description: "Intuitive interface for staff to manage orders and track table status",
      benefits: [
        "Easy order management",
        "Table status tracking",
        "Quick payment processing",
        "Staff-friendly interface"
      ]
    },
    {
      icon: Printer,
      title: "Smart Kitchen Printing",
      description: "Direct Bluetooth printing to kitchen with automatic retries and offline queue",
      benefits: [
        "Bluetooth connectivity",
        "Automatic retries",
        "Offline queue system",
        "Custom print formats"
      ]
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track sales, table turnover, and performance with live dashboards",
      benefits: [
        "Live sales tracking",
        "Performance insights",
        "Table turnover metrics",
        "Staff productivity"
      ]
    },
    {
      icon: Smartphone,
      title: "Mobile Management",
      description: "Manage your restaurant from anywhere with our mobile admin app",
      benefits: [
        "Remote management",
        "Real-time notifications",
        "Menu updates on-the-go",
        "Staff scheduling"
      ]
    },
    {
      icon: Shield,
      title: "Offline Mode",
      description: "Continue taking orders even when internet is down - syncs when back online",
      benefits: [
        "Never lose sales",
        "Automatic sync",
        "Reliable operation",
        "Data protection"
      ]
    }
  ];

  return (
    <section className="min-h-screen py-16 bg-black flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">{feature.title}</h3>
              <p className="text-black leading-relaxed mb-6">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <motion.li 
                    key={benefit} 
                    className="flex items-center gap-2 text-sm text-black"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: benefitIndex * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 