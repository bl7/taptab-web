'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, QrCode, Smartphone, Printer, Shield, Globe, Clock, Users } from 'lucide-react';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      category: "Ordering & Guest Experience",
      icon: QrCode,
      questions: [
        {
          question: "How do guests place orders?",
          answer: "Guests scan a QR code and browse your live menu — no app needed. They can customize orders, add special requests, and place orders directly from their phone&apos;s browser."
        },
        {
          question: "Do guests need to download an app?",
          answer: "No! Guests simply scan the QR code on their table and order through their phone&apos;s web browser. No app download required."
        },
        {
          question: "Can guests track their order status?",
          answer: "Yes, guests can see real-time updates on their order status, from &apos;preparing&apos; to &apos;ready for pickup&apos; or &apos;being served&apos;."
        },
        {
          question: "What languages does TapTab support?",
          answer: "TapTab supports multiple languages to accommodate international guests. You can set up your menu in multiple languages."
        }
      ]
    },
    {
      category: "Technical & Setup",
      icon: Smartphone,
      questions: [
        {
          question: "Does TapTab work offline?",
          answer: "Yes. Orders are queued and synced when back online. Your restaurant can continue taking orders even during internet outages."
        },
        {
          question: "Can we use our existing printers?",
          answer: "TapTab works with most Sunmi/Android-based Bluetooth thermal printers. We also support USB and network printers."
        },
        {
          question: "How do I set up the QR codes?",
          answer: "Simply print our QR codes and place them on your tables. Each QR code is linked to a specific table for easy order management."
        },
        {
          question: "What devices do I need?",
          answer: "You&apos;ll need a tablet or smartphone for staff, a Bluetooth thermal printer for the kitchen, and QR codes for your tables."
        }
      ]
    },
    {
      category: "Kitchen & Printing",
      icon: Printer,
      questions: [
        {
          question: "Can I control which orders get printed?",
          answer: "Yes, only admin devices can auto-print. Staff can also manually trigger print when needed for special orders."
        },
        {
          question: "What if the printer is offline?",
          answer: "Orders are automatically queued and will print when the printer comes back online. No orders are lost."
        },
        {
          question: "Can I customize the print format?",
          answer: "Yes, you can customize ticket layouts, add your logo, and format orders exactly how your kitchen prefers."
        },
        {
          question: "How do I pair my Bluetooth printer?",
          answer: "Our setup wizard guides you through pairing your Bluetooth printer. It&apos;s a simple one-time process."
        }
      ]
    },
    {
      category: "Management & Analytics",
      icon: Shield,
      questions: [
        {
          question: "Can I modify orders after they&apos;re placed?",
          answer: "Yes, staff can edit, cancel, or modify orders through the tablet app before they&apos;re prepared."
        },
        {
          question: "How do I manage my menu?",
          answer: "Update your menu in real-time through the admin dashboard. Changes sync instantly across all devices."
        },
        {
          question: "Can I track sales and performance?",
          answer: "Yes, get real-time analytics on sales, table turnover, popular items, and staff performance."
        },
        {
          question: "How do I manage multiple locations?",
          answer: "Our Premium plan supports multi-location management with centralized control and location-specific settings."
        }
      ]
    },
    {
      category: "Support & Billing",
      icon: Globe,
      questions: [
        {
          question: "What support do you offer?",
          answer: "We offer 24/7 email support, live chat during business hours, and priority phone support for Pro and Premium plans."
        },
        {
          question: "Can I cancel anytime?",
          answer: "Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees."
        },
        {
          question: "Do you offer training?",
          answer: "Yes, we provide free onboarding and training for your team. We also offer advanced training sessions for complex setups."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, bank transfers, and can work with your existing payment processors."
        }
      ]
    }
  ];

  const filteredData = faqData.filter(category =>
    category.questions.some(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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
              <div className="block mb-2">Frequently Asked</div>
              <div className="block">Questions</div>
            </h1>
            <motion.p 
              className="text-xl text-[#CCCCCC] max-w-3xl mx-auto leading-relaxed mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Find answers to common questions about TapTab POS. Can&apos;t find what you&apos;re looking for? Contact our support team.
            </motion.p>
            
            {/* Search Bar */}
            <motion.div 
              className="max-w-2xl mx-auto relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-full focus:border-gray-800 focus:outline-none text-lg bg-white text-black"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredData.map((category, categoryIndex) => (
            <motion.div 
              key={category.category} 
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-semibold text-black">{category.category}</h2>
              </div>
              
              <div className="space-y-4">
                {category.questions.map((item, index) => {
                  const globalIndex = categoryIndex * 100 + index;
                  const isOpen = openItems.includes(globalIndex);
                  
                  return (
                    <motion.div
                      key={index} 
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <motion.button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <h3 className="text-lg font-semibold text-black pr-4">
                          {item.question}
                        </h3>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </motion.button>
                      
                      {isOpen && (
                        <motion.div 
                          className="px-8 pb-6"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="text-gray-600 leading-relaxed">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
          
          {filteredData.length === 0 && searchQuery && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-600 text-lg mb-4">
                No questions found for &ldquo;{searchQuery}&rdquo;
              </p>
              <motion.button
                onClick={() => setSearchQuery('')}
                className="text-black hover:text-gray-800 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear search
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-semibold text-black mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Our support team is here to help. Get in touch and we&apos;ll get back to you within 24 hours.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">24/7 Email Support</h3>
                <p className="text-gray-600">Get help anytime via email</p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Live Chat</h3>
                <p className="text-gray-600">Chat with us during business hours</p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Video Calls</h3>
                <p className="text-gray-600">Screen share for complex issues</p>
              </motion.div>
            </div>
            
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.button 
                className="bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Support
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 