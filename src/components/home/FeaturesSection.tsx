'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { QrCode, Tablet, Printer, BarChart3, Smartphone, Shield } from 'lucide-react';

export default function FeaturesSection() {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Features animation with scroll trigger
    if (featuresRef.current) {
      gsap.fromTo(featuresRef.current.querySelectorAll('.feature-item'),
        { x: -100, opacity: 0, scale: 0.8 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, []);

  const features = [
    {
      icon: QrCode,
      title: "QR Code Ordering",
      description: "Guests scan and order instantly from their phones - no app download required",
      benefit: "Serve guests faster"
    },
    {
      icon: Tablet,
      title: "Tablet POS System",
      description: "Intuitive interface for staff to manage orders and track table status",
      benefit: "Streamline operations"
    },
    {
      icon: Printer,
      title: "Smart Kitchen Printing",
      description: "Direct Bluetooth printing to kitchen with automatic retries and offline queue",
      benefit: "Reduce order errors"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track sales, table turnover, and performance with live dashboards",
      benefit: "Grow your business"
    },
    {
      icon: Smartphone,
      title: "Mobile Management",
      description: "Manage your restaurant from anywhere with our mobile admin app",
      benefit: "Stay in control"
    },
    {
      icon: Shield,
      title: "Offline Mode",
      description: "Continue taking orders even when internet is down - syncs when back online",
      benefit: "Never lose sales"
    }
  ];

  return (
    <div ref={featuresRef} className="py-16 bg-white">
      <div className="px-6">
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-semibold text-black mb-6">
            Everything You Need to Run Your Restaurant
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            From QR ordering to kitchen printing, we&apos;ve got every touchpoint covered to help you serve faster and grow your business.
          </p>
        </motion.div>
        
        <div className="space-y-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="feature-item flex items-start gap-6 py-6 border-b border-gray-100 last:border-b-0"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <span className="text-sm font-medium text-black uppercase tracking-wide">
                    {feature.benefit}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 