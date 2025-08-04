'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      subtitle: "Modern basics, always free",
      price: "£0",
      period: "/month",
      description: "Perfect for new restaurants testing modern POS",
      features: [
        "Up to 5 tables",
        "QR ordering system",
        "Basic menu management",
        "Email support",
        "Mobile-optimized menus",
        "Basic order management",
        "Email notifications"
      ],
      notIncluded: [
        "Kitchen printing integration",
        "Staff scheduling system",
        "Advanced analytics"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      subtitle: "Everything modern restaurants need",
      price: "£29",
      period: "/month",
      description: "Perfect for established restaurants ready to modernize",
      features: [
        "Unlimited tables",
        "Full restaurant management",
        "Smart kitchen printing system",
        "Integrated staff scheduling",
        "Real-time analytics dashboard",
        "Custom branding options",
        "Priority support",
        "Multi-location ready"
      ],
      notIncluded: [],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      subtitle: "For modern restaurant groups",
      price: "Custom",
      period: "pricing",
      description: "Perfect for restaurant groups & chains",
      features: [
        "Everything in Pro, plus:",
        "Multi-brand management",
        "Advanced reporting suite",
        "API access",
        "Dedicated account manager",
        "Custom training & onboarding"
      ],
      notIncluded: [],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const comparison = [
    { feature: "Setup Time", taptab: "30 min", legacy: "4-8 weeks" },
    { feature: "Monthly Cost", taptab: "£0-29", legacy: "£150-400" },
    { feature: "Contract Length", taptab: "None", legacy: "2+ years" },
    { feature: "Staff Training", taptab: "5 min", legacy: "2+ days" },
    { feature: "Kitchen Integration", taptab: "Native", legacy: "Add-on ($$$)" },
    { feature: "Staff Scheduling", taptab: "Included", legacy: "Extra (£50+)" },
    { feature: "Delivery Apps", taptab: "Included*", legacy: "Separate" },
    { feature: "Support", taptab: "Same day", legacy: "Ticket system" }
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
              <div className="block mb-2">Simple Pricing for</div>
              <div className="block">Modern Restaurants</div>
            </h1>
            <motion.p 
              className="text-xl text-[#CCCCCC] max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              No setup fees. No long contracts. Just transparent pricing that scales with you.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`bg-white rounded-2xl shadow-sm border-2 p-8 ${
                  plan.popular ? 'border-black' : 'border-gray-200'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {plan.popular && (
                  <div className="bg-black text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-semibold text-black mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.subtitle}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-black">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                
                <p className="text-black mb-6">{plan.description}</p>
                
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-black">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <X className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-500">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <motion.button 
                  className={`w-full py-3 px-6 rounded-full font-semibold transition-colors ${
                    plan.popular 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.cta}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Why Modern Restaurants Choose TapTab</h2>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-6 bg-gray-100 border-b">
              <div className="font-semibold text-black">Feature</div>
              <div className="font-semibold text-black text-center">TapTab</div>
              <div className="font-semibold text-black text-center">Legacy POS</div>
            </div>
            
            {comparison.map((row, index) => (
              <motion.div
                key={row.feature}
                className="grid grid-cols-3 gap-4 p-6 border-b last:border-b-0"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-black">{row.feature}</div>
                <div className="text-center text-black font-medium">{row.taptab}</div>
                <div className="text-center text-gray-600">{row.legacy}</div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              *Uber Eats/Deliveroo integration coming Q2 2025
            </p>
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
              <div className="block">Your Restaurant?</div>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Start your free trial today. No contracts, no setup fees, no pressure.
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