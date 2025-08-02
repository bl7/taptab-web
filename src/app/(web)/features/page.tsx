'use client';

import { motion } from 'framer-motion';
import { 
  QrCode, 
  Tablet, 
  Printer, 
  BarChart3, 
  Smartphone, 
  Shield,
  Clock,
  Users,
  Zap,
  Globe
} from 'lucide-react';

export default function FeaturesPage() {
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

  const integrations = [
    {
      icon: Clock,
      title: "Payment Processing",
      description: "Integrate with major payment processors for seamless transactions"
    },
    {
      icon: Users,
      title: "Staff Management",
      description: "Track staff performance and manage schedules efficiently"
    },
    {
      icon: Zap,
      title: "Inventory Management",
      description: "Keep track of stock levels and automate reordering"
    },
    {
      icon: Globe,
      title: "Multi-location Support",
      description: "Manage multiple restaurant locations from a single dashboard"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-light text-white mb-6">
              <div className="block mb-2">Everything You Need</div>
              <div className="block">to Run Your Restaurant</div>
            </h1>
            <motion.p 
              className="text-xl text-[#CCCCCC] max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              From QR ordering to kitchen printing, we&apos;ve got every touchpoint covered to help you serve faster and grow your business.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
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
                      <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                      {benefit}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">How It Works</h2>
            <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
              Get started in minutes with our simple setup process
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">Set Up Your Menu</h3>
              <p className="text-black leading-relaxed">
                Upload your menu items, set prices, and customize categories. Add photos and descriptions to make ordering easy for your guests.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">Print QR Codes</h3>
              <p className="text-black leading-relaxed">
                Print our QR codes and place them on your tables. Each code is linked to a specific table for easy order management.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">Start Taking Orders</h3>
              <p className="text-black leading-relaxed">
                Guests scan the QR code and place orders directly from their phones. Orders appear instantly on your tablet and kitchen printer.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Integrations & Add-ons</h2>
            <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
              Extend your restaurant&apos;s capabilities with powerful integrations and add-ons
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <integration.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">{integration.title}</h3>
                <p className="text-black text-sm leading-relaxed">{integration.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              <div className="block mb-2">Ready to Transform</div>
              <div className="block">Your Restaurant?</div>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of restaurants already using TapTab to serve faster and grow their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button 
                className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
              </motion.button>
              <motion.button 
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Schedule Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 