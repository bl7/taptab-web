'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock, TrendingUp, Users } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);

  const contentSections = [
    {
      title: "Kitchen labeling",
      subtitle: "& POS",
      description: "built for the way you work",
      subdescription: "Point-of-sale systems & business software solutions",
      benefits: [
        { icon: Clock, text: "50% faster order processing" },
        { icon: TrendingUp, text: "25% higher table turnover" },
        { icon: Users, text: "Contactless ordering" }
      ]
    },
    {
      title: "Smart Kitchen Printing",
      subtitle: "never miss an order again",
      description: "Direct Bluetooth printing with automatic retries and offline queue",
      subdescription: "Point-of-sale systems & business software solutions",
      benefits: [
        { icon: Clock, text: "Instant order printing" },
        { icon: TrendingUp, text: "Offline queue system" },
        { icon: Users, text: "Auto-retry on failure" }
      ]
    },
    {
      title: "Real-time Analytics",
      subtitle: "grow your business smarter",
      description: "Track sales, table turnover, and performance with live dashboards",
      subdescription: "Point-of-sale systems & business software solutions",
      benefits: [
        { icon: Clock, text: "Live sales tracking" },
        { icon: TrendingUp, text: "Performance insights" },
        { icon: Users, text: "Smart reporting" }
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (window.innerHeight * 2);
      const sectionIndex = Math.floor(scrollPercent * contentSections.length);
      setCurrentSection(Math.min(sectionIndex, contentSections.length - 1));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [contentSections.length]);

  return (
    <section ref={heroRef} className="relative bg-black text-white overflow-hidden min-h-screen flex items-start justify-center px-6 pt-32">
      <div className="w-full max-w-md relative">
        {contentSections.map((section, index) => (
          <motion.div
            key={index}
            className={`${index === currentSection ? 'opacity-100' : 'opacity-0'} ${index !== currentSection ? 'absolute inset-0' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: index === currentSection ? 1 : 0,
              x: index === currentSection ? 0 : -20
            }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-light text-white leading-tight mb-6">
              <div className="block mb-2">Not just a POS.

</div>
              <div className="block mb-2">A smarter way to  </div>
              <div className="block mb-2">run your restaurant</div>
            </h1>
            
            <p className="text-lg text-[#CCCCCC] leading-relaxed mb-8">
              {section.subdescription}
            </p>

            <div className="flex gap-8 text-sm text-[#CCCCCC]">
              {section.benefits.map((benefit, benefitIndex) => (
                <div key={benefitIndex} className="flex items-center gap-2">
                  <benefit.icon className="w-4 h-4 text-white" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 