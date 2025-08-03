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
      image: "SC"
    },
    {
      name: "Miguel Rodriguez",
      role: "Manager, El Sabor Latino",
      content: "The real-time analytics helped us understand our peak hours and optimize our menu. Sales increased by 25% in the first month!",
      rating: 5,
      image: "MR"
    },
    {
      name: "Emma Thompson",
      role: "Chef, The Garden Bistro",
      content: "Kitchen orders print automatically with clear instructions. No more miscommunication between front and back of house. Highly recommended!",
      rating: 5,
      image: "ET"
    },
    {
      name: "David Kim",
      role: "Owner, Seoul BBQ",
      content: "Setup was incredibly easy. Our staff learned the system in one day. The customer experience is now seamless and professional.",
      rating: 5,
      image: "DK"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-black fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <section className="min-h-screen py-16 bg-black flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-semibold text-white mb-6">
            Loved by Restaurant Owners
          </h2>
          <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed">
            See how TapTab is helping restaurants increase efficiency, 
            boost sales, and delight customers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center font-semibold text-sm mr-4">
                  {testimonial.image}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-black">
                    {testimonial.name}
                  </h3>
                  <p className="text-black">
                    {testimonial.role}
                  </p>
                  <div className="flex items-center mt-2">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
                <Quote className="h-5 w-5 text-gray-300" />
              </div>
              
              <p className="text-black leading-relaxed italic text-sm">
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
              <div className="text-3xl font-semibold text-white mb-2">98%</div>
              <div className="text-white text-sm">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white mb-2">40%</div>
              <div className="text-white text-sm">Faster Order Processing</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white mb-2">25%</div>
              <div className="text-white text-sm">Average Sales Increase</div>
            </div>
            <div>
              <div className="text-3xl font-semibold text-white mb-2">500+</div>
              <div className="text-white text-sm">Happy Restaurants</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 