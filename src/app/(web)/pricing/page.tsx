'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield } from 'lucide-react';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small restaurants getting started",
      price: "Free",
      period: "",
      features: [
        "Up to 5 tables",
        "QR code ordering",
        "Basic menu management",
        "Email support",
        "Mobile app for staff",
        "Basic analytics"
      ],
      icon: Star,
      popular: false
    },
    {
      name: "Pro",
      description: "Everything you need to run your restaurant efficiently",
      price: isYearly ? "$29" : "$39",
      period: "/month",
      features: [
        "Unlimited tables",
        "Advanced menu management",
        "Kitchen printing",
        "Real-time analytics",
        "Priority support",
        "Multi-location support",
        "Custom branding",
        "Advanced reporting"
      ],
      icon: Zap,
      popular: true
    },
    {
      name: "Enterprise",
      description: "For large restaurant chains and franchises",
      price: isYearly ? "$99" : "$129",
      period: "/month",
      features: [
        "Everything in Pro",
        "White-label solution",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 phone support",
        "Advanced security",
        "API access",
        "Custom training"
      ],
      icon: Shield,
      popular: false
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
              <div className="block mb-2">Simple, Transparent</div>
              <div className="block">Pricing</div>
            </h1>
            <motion.p 
              className="text-xl text-[#CCCCCC] max-w-3xl mx-auto leading-relaxed mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              No hidden fees, no setup costs. Start free and scale as you grow. All plans include our core QR ordering features.
            </motion.p>
            
            {/* Pricing Toggle */}
            <motion.div 
              className="flex items-center justify-center space-x-4 mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className={`text-lg ${!isYearly ? 'text-white font-semibold' : 'text-gray-400'}`}>
                Monthly
              </span>
              <motion.button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-white' : 'bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-black transition-transform ${
                    isYearly ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </motion.button>
              <span className={`text-lg ${isYearly ? 'text-white font-semibold' : 'text-gray-400'}`}>
                Yearly
                <span className="ml-2 text-sm bg-white text-black px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-gray-800' : ''
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {plan.popular && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    Most Popular
                  </motion.div>
                )}
                
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-black">{plan.name}</h3>
                      <p className="text-black text-sm">{plan.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-black">{plan.price}</span>
                      <span className="text-gray-500 ml-2">{plan.period}</span>
                    </div>
                    {isYearly && plan.name !== "Starter" && (
                      <p className="text-sm text-black mt-1">Save 20% with yearly billing</p>
                    )}
                    {plan.name === "Starter" && (
                      <p className="text-sm text-green-600 mt-1">Always free</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={feature} 
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: featureIndex * 0.1 }}
                      >
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-black">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.button 
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      plan.popular 
                        ? 'bg-black text-white hover:bg-gray-800' 
                        : 'bg-gray-100 text-black hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.name === "Starter" ? "Get Started Free" : "Choose Plan"}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-semibold text-black mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-black max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about our pricing and plans.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold text-black mb-3">Can I change plans anytime?</h3>
              <p className="text-black leading-relaxed">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold text-black mb-3">Is there a setup fee?</h3>
              <p className="text-black leading-relaxed">
                No setup fees. Start with our free plan and upgrade when you&apos;re ready to scale.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold text-black mb-3">What payment methods do you accept?</h3>
              <p className="text-black leading-relaxed">
                We accept all major credit cards, PayPal, and bank transfers for annual plans.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold text-black mb-3">Do you offer refunds?</h3>
              <p className="text-black leading-relaxed">
                We offer a 30-day money-back guarantee. If you&apos;re not satisfied, we&apos;ll refund your payment.
              </p>
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
              <div className="block mb-2">Ready to Get Started?</div>
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
                Contact Sales
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 