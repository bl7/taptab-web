'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, Mail, Move, Clock, Shield, Zap } from 'lucide-react';

export default function RotaFeaturePage() {
  const benefits = [
    {
      icon: Move,
      title: "Data-Driven Scheduling",
      description: "Your rota system learns from your POS data. Schedule more staff when you're actually busy."
    },
    {
      icon: Mail,
      title: "Intelligent Shift Planning",
      description: "See historical sales patterns. Know exactly when you need more kitchen staff vs front-of-house."
    },
    {
      icon: Clock,
      title: "Automatic Cost Calculations",
      description: "Track labor costs in real-time. Stay profitable while ensuring proper staffing levels."
    },
    {
      icon: Shield,
      title: "Seamless Communication",
      description: "Staff get schedules instantly via email. Changes notify everyone automatically."
    }
  ];

  const features = [
    {
      title: "Visual Drag & Drop",
      description: "Create schedules in minutes with intuitive visual planning.",
      icon: Calendar
    },
    {
      title: "Sales Integration",
      description: "See yesterday's sales alongside tomorrow's schedule. Make informed staffing decisions.",
      icon: Users
    },
    {
      title: "Role-Based Scheduling",
      description: "Different access levels for managers vs staff. Everyone sees what they need to see.",
      icon: Shield
    },
    {
      title: "Mobile Access",
      description: "Staff check schedules on their phones. Managers can update schedules from anywhere.",
      icon: Clock
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Add Your Staff",
      description: "Import your staff members with their roles and contact information"
    },
    {
      step: "2", 
      title: "Create Shifts",
      description: "Set up shift templates with start/end times and required roles"
    },
    {
      step: "3",
      title: "Drag & Drop Scheduling", 
      description: "Visually assign staff to shifts with automatic hour calculations"
    },
    {
      step: "4",
      title: "Publish & Notify",
      description: "Publish the rota and automatically email all staff their schedules"
    }
  ];

  const advantages = [
    "Integrated with POS Data",
    "No Double Data Entry",
    "Cost Awareness",
    "One System to Learn"
  ];

  const advantagesDescriptions = [
    "Other apps guess at busy periods. TapTab knows from your actual sales.",
    "Staff info, roles, and hours sync automatically with your POS system.",
    "See labor costs update in real-time as you build schedules.",
    "Staff already know TapTab for orders. Same system for schedules means less training."
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
                  <Calendar className="w-8 h-8 text-white" />
                  <span className="text-sm text-gray-300 uppercase tracking-wide">Staff Management</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-light text-white mb-6">
                  <div className="block mb-2">Smart Staff Scheduling</div>
                  <div className="block">Your rota system that actually understands your business</div>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  Modern restaurants need scheduling that adapts to real sales data, not guesswork.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button 
                    className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Rota System
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
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <span className="text-white">Sarah Johnson</span>
                    </div>
                    <span className="text-gray-300">8.00 hrs</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                      <span className="text-white">Mike Chen</span>
                    </div>
                    <span className="text-gray-300">6.00 hrs</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                      <span className="text-white">Lisa Park</span>
                    </div>
                    <span className="text-gray-300">7.50 hrs</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-600 rounded-lg">
                  <div className="flex items-center gap-2 text-white">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email notifications sent</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Modern Scheduling Matters */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Beyond Basic Rota Management</h2>
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

      {/* Smart Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Scheduling That Thinks Ahead</h2>
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

      {/* The Modern Advantage */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Why This Beats Traditional Scheduling Apps</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {advantages.map((advantage, index) => (
              <motion.div
                key={advantage}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold text-black mb-3">{advantage}</h3>
                <p className="text-black leading-relaxed">{advantagesDescriptions[index]}</p>
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
              <div className="block">Staff Scheduling?</div>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join restaurants already using our rota system to save hours every week on staff scheduling.
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