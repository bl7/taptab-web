'use client';

import { motion } from 'framer-motion';
import { 
  QrCode, 
  Smartphone, 
  Tablet, 
  Printer,
  Clock,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: QrCode,
      title: "1. Set Up Your Menu",
      description: "Upload your menu items, set prices, and customize categories. Add photos and descriptions to make ordering easy for your guests.",
      details: [
        "Create menu categories",
        "Add item photos and descriptions",
        "Set pricing and availability",
        "Customize order modifiers"
      ]
    },
    {
      icon: Smartphone,
      title: "2. Print QR Codes",
      description: "Print our QR codes and place them on your tables. Each code is linked to a specific table for easy order management.",
      details: [
        "Generate table-specific QR codes",
        "Print and place on tables",
        "Link to specific table numbers",
        "Enable instant ordering"
      ]
    },
    {
      icon: Tablet,
      title: "3. Staff Management",
      description: "Your staff can manage orders, track table status, and process payments through our intuitive tablet interface.",
      details: [
        "Real-time order notifications",
        "Table status tracking",
        "Payment processing",
        "Order modifications"
      ]
    },
    {
      icon: Printer,
      title: "4. Kitchen Printing",
      description: "Orders automatically print to your kitchen printer with all details, modifications, and special instructions.",
      details: [
        "Automatic order printing",
        "Custom print formats",
        "Offline queue system",
        "Retry mechanisms"
      ]
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Faster Service",
      description: "Reduce order processing time by up to 70% with instant digital ordering"
    },
    {
      icon: Users,
      title: "Better Experience",
      description: "Guests enjoy the convenience of ordering from their own phones"
    },
    {
      icon: CheckCircle,
      title: "Fewer Errors",
      description: "Eliminate order mistakes with digital order transmission"
    },
    {
      icon: ArrowRight,
      title: "Higher Revenue",
      description: "Increase table turnover and average order value"
    }
  ];

  const setup = [
    {
      title: "Quick Setup",
      description: "Get started in under 30 minutes with our simple onboarding process"
    },
    {
      title: "No Hardware Required",
      description: "Use your existing tablets and printers - no expensive equipment needed"
    },
    {
      title: "24/7 Support",
      description: "Get help whenever you need it with our dedicated support team"
    },
    {
      title: "Free Training",
      description: "We provide free training for you and your staff to ensure success"
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
              <div className="block mb-2">How TapTab</div>
              <div className="block">Works</div>
            </h1>
            <motion.p 
              className="text-xl text-[#CCCCCC] max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              From setup to serving, see how TapTab transforms your restaurant operations in just four simple steps.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
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
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-black">{step.title}</h3>
                  </div>
                  <p className="text-lg text-black leading-relaxed mb-6">{step.description}</p>
                  <ul className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <motion.li 
                        key={detail} 
                        className="flex items-center gap-3 text-black"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: detailIndex * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                        {detail}
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="lg:w-1/2">
                  <div className="bg-gray-100 rounded-2xl p-8 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-white">{index + 1}</span>
                      </div>
                      <p className="text-black">Step {index + 1} Visualization</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Why It Works</h2>
            <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
              TapTab delivers measurable results that transform your restaurant operations
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

      {/* Setup Process */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Getting Started</h2>
            <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
              We make it easy to get up and running with TapTab
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {setup.map((item, index) => (
              <motion.div
                key={item.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <h3 className="text-lg font-semibold text-black mb-3">{item.title}</h3>
                <p className="text-black leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-semibold text-black mb-6">See It in Action</h2>
            <p className="text-xl text-black mb-8 leading-relaxed">
              Watch a quick demo to see how TapTab works in a real restaurant environment
            </p>
            <div className="bg-gray-100 rounded-2xl p-8 h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">▶</span>
                </div>
                <p className="text-black">Demo Video</p>
              </div>
            </div>
          </motion.div>
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
              <div className="block mb-2">Ready to Get</div>
              <div className="block">Started?</div>
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