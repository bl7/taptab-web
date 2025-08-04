'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Owner, Dragon Palace",
      content: "TapTab transformed our restaurant operations. Orders are 40% faster and our customers love the convenience. The QR ordering system is a game-changer!",
      rating: 5,
      image: "SC",
      highlight: "40% faster orders"
    },
    {
      name: "Miguel Rodriguez",
      role: "Manager, El Sabor Latino",
      content: "The real-time analytics helped us understand our peak hours and optimize our menu. Sales increased by 25% in the first month!",
      rating: 5,
      image: "MR",
      highlight: "25% sales increase"
    },
    {
      name: "Emma Thompson",
      role: "Chef, The Garden Bistro",
      content: "Kitchen orders print automatically with clear instructions. No more miscommunication between front and back of house. Highly recommended!",
      rating: 5,
      image: "ET",
      highlight: "Zero miscommunication"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <section className="h-screen bg-black flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Real results from real restaurants
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See how TapTab is helping restaurants increase efficiency, boost sales, and delight customers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index} 
              className="bg-gray-900 rounded-lg border border-gray-700 p-8 hover:border-gray-500 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center font-bold text-lg mr-4">
                  {testimonial.image}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">
                    {testimonial.name}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {testimonial.role}
                  </p>
                  <div className="flex items-center mt-2">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
                <Quote className="h-6 w-6 text-gray-500" />
              </div>
              
              <div className="mb-4">
                <span className="inline-block bg-white text-black px-3 py-1 rounded-full text-sm font-semibold">
                  {testimonial.highlight}
                </span>
              </div>
              
              <p className="text-gray-300 leading-relaxed text-lg">
                &ldquo;{testimonial.content}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-gray-300 text-sm">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">40%</div>
              <div className="text-gray-300 text-sm">Faster Order Processing</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">25%</div>
              <div className="text-gray-300 text-sm">Average Sales Increase</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-300 text-sm">Happy Restaurants</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 