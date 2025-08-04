'use client';

import { motion } from 'framer-motion';
import { QrCode, Smartphone, Tablet, Zap, Shield, Users, Clock } from 'lucide-react';

export default function QROrderingFeaturePage() {
  // const benefits = [
  //   {
  //     icon: Zap,
  //     title: "Instant Ordering",
  //     description: "Guests order in seconds, no app download required"
  //   },
  //   {
  //     icon: Shield,
  //     title: "No App Required",
  //     description: "Works on any smartphone with a camera"
  //   },
  //   {
  //     icon: Clock,
  //     title: "Faster Service",
  //     description: "Reduce order processing time by up to 70%"
  //   },
  //   {
  //     icon: Users,
  //     title: "Better Experience",
  //     description: "Guests enjoy ordering from their own phones"
  //   }
  // ];

  const features = [
    {
      title: "Table-Specific QR Codes",
      description: "Each table gets its own unique QR code that links directly to your menu. Orders are automatically assigned to the correct table for seamless service.",
      icon: QrCode
    },
    {
      title: "Mobile-First Design",
      description: "Menus look stunning on any phone. Easy to navigate, easy to customize orders.",
      icon: Smartphone
    },
    {
      title: "Kitchen Integration",
      description: "Orders flow directly to your kitchen display and printers. No middleware, no delays.",
      icon: Tablet
    },
    {
      title: "Payment Processing",
      description: "Secure checkout with all major cards. Guests pay when they order, reducing table turnover time.",
      icon: Clock
    }
  ];

  // const howItWorks = [
  //   {
  //     step: "1",
  //     title: "Print QR Codes",
  //     description: "Generate and print QR codes for each table"
  //   },
  //   {
  //     step: "2", 
  //     title: "Place on Tables",
  //     description: "Attach QR codes to tables or table tents"
  //   },
  //   {
  //     step: "3",
  //     title: "Guests Scan & Order", 
  //     description: "Customers scan with their phone camera"
  //   },
  //   {
  //     step: "4",
  //     title: "Instant Processing",
  //     description: "Orders appear immediately on your system"
  //   }
  // ];

  const successMetrics = [
    { metric: "40%", label: "faster table turnover" },
    { metric: "95%", label: "guest satisfaction with ordering experience" },
    { metric: "60%", label: "reduction in order errors" },
    { metric: "3 min", label: "average order completion time" },
    { metric: "18%", label: "increase in average order value" }
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
                  <div className="block mb-2">QR Ordering</div>
                  <div className="block">Built for Modern Dining</div>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  Transform how guests order with QR technology that actually enhances the dining experience.
                  No apps to download. No friction. Just modern convenience.
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

      {/* The Modern QR Experience */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">How Modern QR Ordering Should Work</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              <h3 className="text-xl font-semibold text-black mb-3">Guests Scan & Order</h3>
              <p className="text-black leading-relaxed">Beautiful mobile menus that load instantly. Clear photos, easy customization, smooth checkout.</p>
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
              <h3 className="text-xl font-semibold text-black mb-3">Kitchen Gets Orders Instantly</h3>
              <p className="text-black leading-relaxed">No delays, no transcription errors. Orders appear on kitchen screens and print automatically.</p>
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
              <h3 className="text-xl font-semibold text-black mb-3">Real-Time Order Tracking</h3>
              <p className="text-black leading-relaxed">Guests see exactly when their food is being prepared and when it&apos;s ready.</p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">Staff Stay Focused</h3>
              <p className="text-black leading-relaxed">No more taking orders during busy periods. Staff focus on food and service, not order-taking.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features That Matter */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Built for Real Restaurant Operations</h2>
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

      {/* Success Metrics */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">What Modern Restaurants See with TapTab QR Ordering</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {successMetrics.map((metric, index) => (
              <motion.div
                key={metric.metric}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-black mb-2">{metric.metric}</div>
                <p className="text-black text-sm leading-relaxed">{metric.label}</p>
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