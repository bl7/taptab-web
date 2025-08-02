'use client';

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
      title: "Cafes & Coffee Shops",
      description: "Perfect for cafes serving coffee, pastries, and light meals",
      features: [
        "Quick order processing",
        "Simple menu management",
        "Fast payment processing",
        "Mobile-friendly ordering"
      ],
      benefits: [
        "Reduce wait times by 40%",
        "Increase table turnover",
        "Improve order accuracy",
        "Enhance customer experience"
      ]
    },
    {
      icon: Utensils,
      title: "Full-Service Restaurants",
      description: "Comprehensive solution for restaurants with complex menus and service",
      features: [
        "Advanced menu customization",
        "Kitchen printing system",
        "Table management",
        "Staff coordination"
      ],
      benefits: [
        "Streamline operations",
        "Reduce order errors",
        "Improve kitchen efficiency",
        "Enhance guest experience"
      ]
    },
    {
      icon: Pizza,
      title: "Pizza & Fast Food",
      description: "Optimized for quick-service restaurants with high order volumes",
      features: [
        "High-speed ordering",
        "Kitchen display system",
        "Delivery management",
        "Order tracking"
      ],
      benefits: [
        "Handle peak rush hours",
        "Reduce order processing time",
        "Improve delivery accuracy",
        "Increase order volume"
      ]
    },
    {
      icon: IceCream,
      title: "Dessert & Ice Cream Shops",
      description: "Specialized for dessert shops with customizable menu items",
      features: [
        "Customization options",
        "Allergen tracking",
        "Seasonal menu management",
        "Quick service setup"
      ],
      benefits: [
        "Accommodate special requests",
        "Manage seasonal offerings",
        "Speed up service",
        "Reduce waste"
      ]
    },
    {
      icon: Beer,
      title: "Bars & Pubs",
      description: "Tailored for bars and pubs with drink menus and food service",
      features: [
        "Drink menu management",
        "Happy hour pricing",
        "Tab management",
        "Bar inventory tracking"
      ],
      benefits: [
        "Streamline drink orders",
        "Manage happy hour promotions",
        "Improve bar efficiency",
        "Reduce order errors"
      ]
    },
    {
      icon: Wine,
      title: "Fine Dining",
      description: "Premium solution for upscale restaurants with sophisticated service",
      features: [
        "Wine pairing suggestions",
        "Course-by-course service",
        "Sommelier integration",
        "Reservation management"
      ],
      benefits: [
        "Enhance dining experience",
        "Improve wine sales",
        "Streamline service flow",
        "Maintain service standards"
      ]
    }
  ];

  const industries = [
    {
      icon: Users,
      title: "Small Restaurants",
      description: "Perfect for independent restaurants with 5-20 tables"
    },
    {
      icon: Clock,
      title: "Quick Service",
      description: "Ideal for fast-casual restaurants and food trucks"
    },
    {
      icon: Zap,
      title: "Multi-location",
      description: "Scalable solution for restaurant chains and franchises"
    },
    {
      icon: Shield,
      title: "Enterprise",
      description: "Custom solutions for large restaurant groups"
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
              <div className="block">Type of Restaurant</div>
            </h1>
            <motion.p 
              className="text-xl text-[#CCCCCC] max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              From cafes to fine dining, we have specialized solutions designed for your specific restaurant type and needs.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                  <solution.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">{solution.title}</h3>
                <p className="text-black leading-relaxed mb-6">{solution.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">Key Features</h4>
                  <ul className="space-y-2">
                    {solution.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={feature} 
                        className="flex items-center gap-2 text-sm text-black"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: featureIndex * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">Benefits</h4>
                  <ul className="space-y-2">
                    {solution.benefits.map((benefit, benefitIndex) => (
                      <motion.li 
                        key={benefit} 
                        className="flex items-center gap-2 text-sm text-black"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: benefitIndex * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Restaurant Types</h2>
            <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
              Whether you&apos;re a small independent restaurant or a large chain, we have solutions that scale with your business.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <industry.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">{industry.title}</h3>
                <p className="text-black text-sm leading-relaxed">{industry.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Success Stories</h2>
            <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
              See how restaurants like yours are transforming their operations with TapTab
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold text-black mb-4">The Coffee Corner</h3>
              <p className="text-black leading-relaxed mb-4">
                &ldquo;TapTab helped us reduce wait times by 50% and increase our daily orders by 30%. Our customers love the convenience of ordering from their phones.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold text-black">Sarah Johnson</p>
                  <p className="text-sm text-black">Owner, The Coffee Corner</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold text-black mb-4">Pizza Palace</h3>
              <p className="text-black leading-relaxed mb-4">
                &ldquo;Our order processing time went from 8 minutes to 3 minutes. The kitchen printing system eliminated all order errors. TapTab is a game-changer.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold text-black">Mike Chen</p>
                  <p className="text-sm text-black">Manager, Pizza Palace</p>
                </div>
              </div>
            </motion.div>
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