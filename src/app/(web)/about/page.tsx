'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  Heart, 
  Zap, 
  Shield,
  Globe,
  Coffee,
  Utensils,
  Truck
} from 'lucide-react';

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "Former restaurant owner who experienced the pain points of traditional POS systems firsthand.",
      image: "/logo.png",
      linkedin: "#"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Tech veteran with 15+ years building scalable restaurant technology solutions.",
      image: "/logo.png",
      linkedin: "#"
    },
    {
      name: "Emma Rodriguez",
      role: "Head of Customer Success",
      bio: "Passionate about helping restaurants succeed with technology that actually works.",
      image: "/logo.png",
      linkedin: "#"
    },
    {
      name: "David Kim",
      role: "Head of Product",
      bio: "Product designer focused on creating intuitive experiences for busy restaurant staff.",
      image: "/logo.png",
      linkedin: "#"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "We put restaurant owners and their success at the center of everything we do."
    },
    {
      icon: Zap,
      title: "Simplicity",
      description: "Complex problems deserve simple solutions. We make technology work for you."
    },
    {
      icon: Shield,
      title: "Reliability",
      description: "Your restaurant never stops, so neither does our technology."
    },
    {
      icon: Users,
      title: "Community",
      description: "We&apos;re building a community of restaurant owners who support each other."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Company Founded",
      description: "Started with a simple mission: make restaurant technology work for restaurants."
    },
    {
      year: "2021",
      title: "First 100 Restaurants",
      description: "Reached our first milestone with 100 restaurants using TapTab POS."
    },
    {
      year: "2022",
      title: "Series A Funding",
      description: "Raised $5M to scale our team and expand our product offerings."
    },
    {
      year: "2023",
      title: "500+ Restaurants",
      description: "Now serving over 500 restaurants across the UK and Europe."
    },
    {
      year: "2024",
      title: "International Expansion",
      description: "Launching in new markets and introducing advanced features."
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
              <div className="block mb-2">We&apos;re on a mission</div>
              <div className="block mb-2">to revolutionize</div>
              <div className="block">restaurant technology</div>
            </h1>
            <motion.p 
              className="text-xl text-[#CCCCCC] max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              We&apos;re on a mission to revolutionize how restaurants operate with simple, powerful technology that actually works.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-semibold text-black mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-black leading-relaxed">
                <p>
                  TapTab was born from frustration. Our founder, Sarah, ran a successful restaurant for 8 years and constantly struggled with clunky, expensive POS systems that made her job harder, not easier.
                </p>
                <p>
                  After one too many system crashes during peak hours, she decided to build the solution she wished she had: a simple, reliable POS system that actually helps restaurants serve their customers better.
                </p>
                <p>
                  Today, we&apos;re helping 500+ restaurants across the UK and Europe serve faster, reduce errors, and grow their business with technology that just works.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gray-50 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Coffee className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-medium text-black text-sm">Restaurant Experience</h3>
                    <p className="text-xs text-black">Built by restaurant owners</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Utensils className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-medium text-black text-sm">Simple & Fast</h3>
                    <p className="text-xs text-black">Designed for speed</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-medium text-black text-sm">Always Reliable</h3>
                    <p className="text-xs text-black">Never let you down</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-medium text-black text-sm">Growing Fast</h3>
                    <p className="text-xs text-black">500+ restaurants</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Our Mission</h2>
            <p className="text-xl text-black max-w-3xl mx-auto mb-12 leading-relaxed">
              To empower restaurants with technology that makes their lives easier, their service faster, and their business more profitable.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">{value.title}</h3>
                <p className="text-black leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Meet Our Team</h2>
            <p className="text-xl text-black max-w-3xl mx-auto">
              The passionate people behind TapTab who are committed to making restaurant technology work for you.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-1">{member.name}</h3>
                <p className="text-black mb-3">{member.role}</p>
                <p className="text-black text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-semibold text-black mb-6">Our Journey</h2>
            <p className="text-xl text-black max-w-3xl mx-auto">
              From a simple idea to serving hundreds of restaurants across Europe.
            </p>
          </motion.div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-300 h-full hidden md:block"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  className="relative"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="hidden md:flex items-center">
                    {index % 2 === 0 ? (
                      <>
                        <div className="w-1/2 pr-8 text-right">
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-2xl font-bold text-black mb-2">{milestone.year}</div>
                            <h3 className="text-xl font-semibold text-black mb-2">{milestone.title}</h3>
                            <p className="text-black">{milestone.description}</p>
                          </div>
                        </div>
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-800 rounded-full border-4 border-white shadow-lg"></div>
                        <div className="w-1/2 pl-8"></div>
                      </>
                    ) : (
                      <>
                        <div className="w-1/2 pr-8"></div>
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-800 rounded-full border-4 border-white shadow-lg"></div>
                        <div className="w-1/2 pl-8">
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-2xl font-bold text-black mb-2">{milestone.year}</div>
                            <h3 className="text-xl font-semibold text-black mb-2">{milestone.title}</h3>
                            <p className="text-black">{milestone.description}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="md:hidden">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="text-2xl font-bold text-black mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-black mb-2">{milestone.title}</h3>
                      <p className="text-black">{milestone.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              <div className="block mb-2">Join Our Mission</div>
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Ready to transform your restaurant with technology that actually works? Let&apos;s get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button 
                className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial
              </motion.button>
              <motion.button 
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-all duration-200"
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