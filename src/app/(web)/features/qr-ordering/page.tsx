'use client';

import { motion } from 'framer-motion';
import { QrCode, Smartphone, Tablet, Zap, Shield, Users, Clock } from 'lucide-react';

export default function QROrderingFeaturePage() {
  const benefits = [
    {
      icon: Zap,
      title: "Instant Ordering",
      description: "Guests order in seconds, no app download required"
    },
    {
      icon: Shield,
      title: "No App Required",
      description: "Works on any smartphone with a camera"
    },
    {
      icon: Clock,
      title: "Faster Service",
      description: "Reduce order processing time by up to 70%"
    },
    {
      icon: Users,
      title: "Better Experience",
      description: "Guests enjoy ordering from their own phones"
    }
  ];

  const features = [
    {
      title: "Table-Specific QR Codes",
      description: "Each table gets its own unique QR code that links directly to your menu. Orders are automatically assigned to the correct table for seamless service.",
      icon: QrCode
    },
    {
      title: "Mobile-Optimized Menu",
      description: "Your menu displays beautifully on any smartphone. High-quality photos, detailed descriptions, and easy customization options make ordering a pleasure.",
      icon: Smartphone
    },
    {
      title: "Real-Time Order Updates",
      description: "Guests can track their order status in real-time. From 'preparing' to 'ready for pickup', they always know what's happening with their order.",
      icon: Tablet
    },
    {
      title: "Instant Kitchen Notifications",
      description: "Orders appear instantly on your tablet and kitchen printer. No more lost tickets or misheard orders - everything is digital and accurate.",
      icon: Clock
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Print QR Codes",
      description: "Generate and print QR codes for each table"
    },
    {
      step: "2", 
      title: "Place on Tables",
      description: "Attach QR codes to tables or table tents"
    },
    {
      step: "3",
      title: "Guests Scan & Order", 
      description: "Customers scan with their phone camera"
    },
    {
      step: "4",
      title: "Instant Processing",
      description: "Orders appear immediately on your system"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <QrCode className="w-8 h-8 text-white" />
                  <span className="text-sm text-gray-300 uppercase tracking-wide">Digital Ordering</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-light text-white mb-6">
                  <div className="block mb-2">QR Code</div>
                  <div className="block">Ordering</div>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  Transform your restaurant with instant QR code ordering. Guests scan and order from their phones - 
                  no app download required. Faster service, happier customers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button 
                    className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try QR Ordering
                  </motion.button>
                  <motion.button 
                    className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Watch Demo
                  </motion.button>
                </div>
              </motion.div>
            </div>
            <div className="lg:w-1/2">
              <motion.div
                className="bg-gray-900 rounded-2xl p-8 border border-gray-700"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-black">Table 5</h3>
                      <span className="text-sm text-gray-500">2 guests</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black">Burger Deluxe</span>
                        <span className="text-sm text-black">$12.99</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black">Fries</span>
                        <span className="text-sm text-black">$4.99</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black">Coke</span>
                        <span className="text-sm text-black">$2.99</span>
                      </div>
                    </div>
                    <div className="border-t mt-3 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-black">Total</span>
                        <span className="font-semibold text-black">$20.97</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Order received - 2 min ago</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Why QR Code Ordering?</h2>
            <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
              The most efficient way to take orders in your restaurant
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">{benefit.title}</h3>
                <p className="text-black text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Powerful Features</h2>
            <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
              Everything you need for seamless QR code ordering
            </p>
          </motion.div>

          <div className="space-y-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="lg:w-1/2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-black">{feature.title}</h3>
                  </div>
                  <p className="text-lg text-black leading-relaxed">{feature.description}</p>
                </div>
                <div className="lg:w-1/2">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-black">{feature.title} Demo</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
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
              Get QR code ordering up and running in just four simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">{step.title}</h3>
                <p className="text-black leading-relaxed">{step.description}</p>
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
              <div className="block">Your Ordering?</div>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join restaurants already using QR code ordering to serve faster and increase customer satisfaction.
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