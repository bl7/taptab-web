'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, TrendingUp, Clock, Users } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Owner",
      company: "The Golden Dragon",
      content: "TapTab POS cut our order time in half. Our guests love the QR ordering!",
      rating: 5,
      avatar: "/logo.png",
      metrics: {
        icon: Clock,
        value: "50%",
        label: "Faster order processing"
      }
    },
    {
      name: "Marcus Rodriguez",
      role: "Manager",
      company: "Café Bella",
      content: "The Bluetooth printing is a game-changer. No more lost orders!",
      rating: 5,
      avatar: "/logo.png",
      metrics: {
        icon: TrendingUp,
        value: "25%",
        label: "Higher table turnover"
      }
    },
    {
      name: "Emma Thompson",
      role: "Chef",
      company: "Urban Kitchen",
      content: "Finally, a POS that actually works for busy kitchens.",
      rating: 5,
      avatar: "/logo.png",
      metrics: {
        icon: Users,
        value: "30%",
        label: "Fewer order errors"
      }
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="px-6">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Real results from real restaurants using TapTab POS.
          </p>
        </motion.div>
        
        <div className="space-y-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="flex items-start gap-6 py-6 border-b border-gray-200 last:border-b-0"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex-shrink-0">
                <Image 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  width={60} 
                  height={60}
                  className="rounded-full"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    <testimonial.metrics.icon className="w-4 h-4 text-black" />
                    <span className="text-sm font-medium text-black">{testimonial.metrics.value} {testimonial.metrics.label}</span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 italic text-lg leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          className="mt-16 pt-8 border-t border-gray-200"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-8">
            Trusted by 500+ Restaurants
          </h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">500+</div>
              <div className="text-gray-600">Active Restaurants</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">50%</div>
              <div className="text-gray-600">Average Time Savings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">25%</div>
              <div className="text-gray-600">Higher Table Turnover</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">4.9/5</div>
              <div className="text-gray-600">Customer Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 