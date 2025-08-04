'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Coffee, 
  Utensils, 
  Pizza, 
  IceCream,
  Beer,
  Wine,
  Users,
  Clock,
  Zap,
  Shield
} from 'lucide-react';

export default function SolutionsPage() {
  const solutions = [
    {
      icon: Coffee,
      title: "Quick Service & Casual Dining",
      description: "Perfect for Modern Quick Service",
      subtitle: "Speed meets efficiency meets great guest experience",
      features: [
        "Lightning-fast QR ordering for high volume",
        "Kitchen printing that keeps pace with demand",
        "Staff scheduling based on actual rush patterns",
        "Seamless payment processing",
        "Real-time analytics for operational insights"
      ],
      results: [
        "⚡ 50% faster order processing",
        "📊 35% improvement in labor cost management",
        "🎯 25% reduction in order errors",
        "💰 20% increase in peak hour efficiency"
      ],
      bestFor: "Fast-casual, coffee shops, counter service, food halls"
    },
    {
      icon: Utensils,
      title: "Full-Service Dining",
      description: "Elevate Full-Service Dining",
      subtitle: "Modern table service without the traditional friction",
      features: [
        "QR ordering that enhances (doesn't replace) service",
        "Kitchen coordination that eliminates ticket confusion",
        "Staff scheduling that matches your service patterns",
        "Table management that flows with your operations",
        "Guest experience that feels premium, not tech-heavy"
      ],
      results: [
        "🍽️ 30% faster table turnover",
        "👥 Better staff efficiency during peak periods",
        "📈 Higher guest satisfaction scores",
        "💡 Data-driven operational insights"
      ],
      bestFor: "Casual dining, bistros, pubs, neighborhood restaurants"
    }
  ];

  const specialtyApplications = [
    {
      icon: Coffee,
      title: "Cafes & Coffee Shops",
      description: "High-volume, fast-paced ordering with mobile-first design"
    },
    {
      icon: Pizza,
      title: "Pizza & Fast Food",
      description: "Kitchen display systems that handle customization and speed"
    },
    {
      icon: Users,
      title: "Multi-Location Groups",
      description: "Centralized management with location-specific customization"
    },
    {
      icon: Zap,
      title: "Pop-ups & Food Trucks",
      description: "Lightweight setup that travels with your business"
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
              <div className="block mb-2">Solutions for Every</div>
              <div className="block">Modern Restaurant</div>
            </h1>
            <motion.p 
              className="text-xl text-[#CCCCCC] max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              From quick-service to fine dining, TapTab adapts to how you actually operate.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Primary Market: Quick Service */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                  {React.createElement(solutions[0].icon, { className: "w-8 h-8 text-white" })}
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-black">{solutions[0].title}</h2>
                  <p className="text-gray-600">{solutions[0].subtitle}</p>
                </div>
              </div>
              
              <p className="text-lg text-black leading-relaxed mb-8">{solutions[0].description}</p>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-black mb-4">What Quick Service Gets with TapTab:</h3>
                <ul className="space-y-3">
                  {solutions[0].features.map((feature, index) => (
                    <motion.li 
                      key={feature} 
                      className="flex items-start gap-3 text-black"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2 flex-shrink-0"></div>
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-black mb-4">Results Modern QSR Sees:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {solutions[0].results.map((result, index) => (
                    <motion.div
                      key={result}
                      className="text-black"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      {result}
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Best for:</strong> {solutions[0].bestFor}
              </p>
            </motion.div>
            
            <motion.div
              className="bg-gray-100 rounded-2xl p-8 h-96 flex items-center justify-center"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  {React.createElement(solutions[0].icon, { className: "w-10 h-10 text-white" })}
                </div>
                <p className="text-black">Quick Service Demo</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Secondary Market: Full Service */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gray-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    {React.createElement(solutions[1].icon, { className: "w-10 h-10 text-white" })}
                  </div>
                  <p className="text-black">Full Service Demo</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                  {React.createElement(solutions[1].icon, { className: "w-8 h-8 text-white" })}
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-black">{solutions[1].title}</h2>
                  <p className="text-gray-600">{solutions[1].subtitle}</p>
                </div>
              </div>
              
              <p className="text-lg text-black leading-relaxed mb-8">{solutions[1].description}</p>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-black mb-4">What Full Service Gets with TapTab:</h3>
                <ul className="space-y-3">
                  {solutions[1].features.map((feature, index) => (
                    <motion.li 
                      key={feature} 
                      className="flex items-start gap-3 text-black"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2 flex-shrink-0"></div>
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-black mb-4">Results Modern Full-Service Sees:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {solutions[1].results.map((result, index) => (
                    <motion.div
                      key={result}
                      className="text-black"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      {result}
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Best for:</strong> {solutions[1].bestFor}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Specialty Applications */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Built for Modern Operations</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {specialtyApplications.map((app, index) => (
              <motion.div
                key={app.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <app.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">{app.title}</h3>
                <p className="text-black text-sm leading-relaxed">{app.description}</p>
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
              <div className="block mb-2">Find Your Perfect</div>
              <div className="block">Solution</div>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Let us help you choose the right solution for your restaurant. Our team will work with you to find the perfect fit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button 
                className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.button>
              <motion.button 
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Talk to Sales
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 