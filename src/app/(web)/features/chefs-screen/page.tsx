'use client';

import { motion } from 'framer-motion';
import { UtensilsCrossed, Clock, CheckCircle, BarChart3 } from 'lucide-react';

export default function ChefsScreenFeaturePage() {
  const features = [
    {
      title: "Real-Time Order Display",
      description: "Orders appear instantly on kitchen displays with clear timing, table information, and special instructions. No more lost tickets or confusion.",
      icon: UtensilsCrossed
    },
    {
      title: "Smart Order Prioritization",
      description: "Automatically sorts orders by prep time and table priority. Kitchen staff know exactly what to cook first for optimal service flow.",
      icon: Clock
    },
    {
      title: "Kitchen Communication Hub",
      description: "Direct communication between kitchen and front-of-house. Mark items ready, flag issues, and coordinate service seamlessly.",
      icon: CheckCircle
    },
    {
      title: "Performance Analytics",
      description: "Track kitchen timing, identify bottlenecks, and optimize workflow with detailed preparation time analytics and reporting.",
      icon: BarChart3
    }
  ];

  const successMetrics = [
    { metric: "35%", label: "faster order completion" },
    { metric: "90%", label: "reduction in order errors" },
    { metric: "2 min", label: "average order prep time visibility" },
    { metric: "50%", label: "less kitchen confusion" },
    { metric: "25%", label: "improvement in service timing" }
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
                  <UtensilsCrossed className="w-8 h-8 text-white" />
                  <span className="text-sm text-gray-300 uppercase tracking-wide">Kitchen Display System</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-light text-white mb-6">
                  <div className="block mb-2">Chef&apos;s Screen</div>
                  <div className="block">Kitchen Command Center</div>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  Transform your kitchen operations with a digital display system that eliminates paper tickets, 
                  reduces errors, and keeps your kitchen running at peak efficiency.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button 
                    className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Chef&apos;s Screen
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
                  <div className="bg-orange-500 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Table 3 - Order #152</h3>
                      <span className="text-sm bg-white/20 px-2 py-1 rounded">🔥 RUSH</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">2x Burger Deluxe</span>
                        <span className="text-sm">7 min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">1x Fish & Chips</span>
                        <span className="text-sm">12 min</span>
                      </div>
                      <div className="text-xs text-orange-200 mt-2">
                        Special: No onions on burgers
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Table 7 - Order #148</h3>
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="text-sm">Ready for service</div>
                  </div>
                  <div className="bg-blue-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Table 1 - Order #150</h3>
                      <span className="text-sm">5 min remaining</span>
                    </div>
                    <div className="text-sm">In preparation</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How Kitchen Display Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">How Modern Kitchen Operations Should Work</h2>
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
              <h3 className="text-xl font-semibold text-black mb-3">Orders Arrive Instantly</h3>
              <p className="text-black leading-relaxed">New orders appear immediately on kitchen displays with timing, table info, and special instructions.</p>
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
              <h3 className="text-xl font-semibold text-black mb-3">Smart Prioritization</h3>
              <p className="text-black leading-relaxed">Orders automatically sort by prep time and urgency. Your kitchen always knows what to cook first.</p>
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
              <h3 className="text-xl font-semibold text-black mb-3">Real-Time Status Updates</h3>
              <p className="text-black leading-relaxed">Mark items as ready, flag issues, or communicate special requirements with one tap.</p>
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
              <h3 className="text-xl font-semibold text-black mb-3">Service Coordination</h3>
              <p className="text-black leading-relaxed">Front-of-house staff see exactly when orders are ready for pickup and delivery to guests.</p>
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
            <h2 className="text-4xl font-semibold text-black mb-6">Built for Professional Kitchen Operations</h2>
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
            <h2 className="text-4xl font-semibold text-black mb-6">What Professional Kitchens See with TapTab Chef&apos;s Screen</h2>
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
              <div className="block mb-2">Ready to Modernize</div>
              <div className="block">Your Kitchen?</div>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join restaurants already using Chef&apos;s Screen to eliminate paper tickets, reduce errors, and serve faster.
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
