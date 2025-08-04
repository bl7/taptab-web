'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, Mail, Move, Clock, Shield, Zap } from 'lucide-react';

export default function RotaFeaturePage() {
  const benefits = [
    {
      icon: Move,
      title: "Drag & Drop Interface",
      description: "Intuitive visual scheduling that anyone can use in minutes"
    },
    {
      icon: Mail,
      title: "Automatic Email Notifications",
      description: "Staff receive their schedules instantly via email"
    },
    {
      icon: Clock,
      title: "Weekly Schedule Management",
      description: "Plan entire weeks with total hours tracking"
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Only managers can edit schedules, staff can view only"
    }
  ];

  const features = [
    {
      title: "Visual Scheduling",
      description: "Drag and drop staff members to different shifts with real-time updates. See total hours calculated automatically for each staff member and day.",
      icon: Calendar
    },
    {
      title: "Email Notifications",
      description: "When you publish a rota, all staff automatically receive an email with their complete weekly schedule. No more manual communication.",
      icon: Mail
    },
    {
      title: "Past Week Protection",
      description: "Prevent accidental changes to completed schedules. Past weeks become read-only automatically.",
      icon: Shield
    },
    {
      title: "Saved Rota History",
      description: "Access all your previous rotas through a dropdown menu. Switch between different weeks instantly.",
      icon: Users
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
                  <div className="block mb-2">Smart Rota</div>
                  <div className="block">System</div>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed mb-8">
                  Transform how you manage staff schedules with our intuitive drag-and-drop rota system. 
                  Create schedules in minutes and automatically notify your team via email.
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
            <h2 className="text-4xl font-semibold text-black mb-6">Why Choose Our Rota System?</h2>
            <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
              Designed specifically for restaurants to make staff scheduling effortless and efficient
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
              Everything you need to manage your staff schedules effectively
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
              Get your rota system up and running in just four simple steps
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