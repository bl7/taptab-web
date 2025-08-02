'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';

export default function BlogPage() {
  const blogPosts = [
    {
      title: "How to Implement QR Code Ordering in Your Restaurant",
      excerpt: "Learn the step-by-step process to set up QR code ordering and boost your table turnover by 25%.",
      category: "QR Ordering",
      readTime: "5 min read",
      date: "March 15, 2024",
      image: "/logo.png",
      featured: true
    },
    {
      title: "10 Ways to Increase Restaurant Revenue with Technology",
      excerpt: "Discover proven strategies to boost your restaurant's revenue using modern POS technology.",
      category: "Revenue",
      readTime: "8 min read",
      date: "March 12, 2024",
      image: "/logo.png",
      featured: false
    },
    {
      title: "The Complete Guide to Restaurant Analytics",
      excerpt: "Understand your restaurant data to make better business decisions and grow your profits.",
      category: "Analytics",
      readTime: "6 min read",
      date: "March 10, 2024",
      image: "/logo.png",
      featured: false
    },
    {
      title: "How to Choose the Right POS System for Your Restaurant",
      excerpt: "A comprehensive guide to selecting the perfect POS system for your restaurant type and size.",
      category: "POS Guide",
      readTime: "7 min read",
      date: "March 8, 2024",
      image: "/logo.png",
      featured: false
    },
    {
      title: "Boosting Takeout Sales: Strategies That Work",
      excerpt: "Learn how to increase your takeout and delivery orders with proven marketing strategies.",
      category: "Takeout",
      readTime: "4 min read",
      date: "March 5, 2024",
      image: "/logo.png",
      featured: false
    },
    {
      title: "Local SEO for Restaurants: Get Found Online",
      excerpt: "Optimize your restaurant's online presence to attract more local customers.",
      category: "Marketing",
      readTime: "9 min read",
      date: "March 3, 2024",
      image: "/logo.png",
      featured: false
    }
  ];

  const categories = ["All", "QR Ordering", "Revenue", "Analytics", "POS Guide", "Takeout", "Marketing"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Restaurant Industry
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 block">
              Insights & Tips
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Expert advice, industry trends, and practical tips to help your restaurant thrive in the digital age.
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    category === "All" 
                      ? "bg-orange-500 text-white" 
                      : "bg-white text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Article</h2>
          {blogPosts.filter(post => post.featured).map((post) => (
            <motion.div
              key={post.title}
              className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="md:flex">
                <div className="md:w-1/3">
                  <div className="h-64 md:h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">QR</span>
                    </div>
                  </div>
                </div>
                <div className="md:w-2/3 p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h3>
                  <p className="text-gray-600 text-lg mb-6">{post.excerpt}</p>
                  <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                    Read Full Article
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.filter(post => !post.featured).map((post, index) => (
              <motion.div
                key={post.title}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{post.category.charAt(0)}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">{post.date}</span>
                    <button className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1">
                      Read More
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Stay Updated with Restaurant Tips
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Get the latest restaurant industry insights, tips, and TapTab POS updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-orange-600 px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 