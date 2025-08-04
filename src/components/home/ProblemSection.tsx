'use client';

import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

export default function ProblemSection() {
  const problems = [
    {
      icon: X,
      title: "Old POS Thinking",
      description: "Complex systems designed for corporate chains, not real restaurants"
    },
    {
      icon: X,
      title: "Disconnected Systems",
      description: "Separate apps for ordering, printing, scheduling - nothing talks to each other"
    },
    {
      icon: X,
      title: "Staff Confusion",
      description: "Different systems for different tasks - staff waste time learning multiple tools"
    },
    {
      icon: X,
      title: "Data Silos",
      description: "Sales data here, staff data there - no unified view of your business"
    }
  ];

  const modernNeeds = [
    {
      icon: Check,
      title: "Modern Restaurant Reality",
      description: "Simple tools that work together, designed for how you actually operate"
    },
    {
      icon: Check,
      title: "Everything Connected",
      description: "Orders flow to kitchen, staff schedules sync with sales, all in one place"
    },
    {
      icon: Check,
      title: "Staff Efficiency",
      description: "One system to learn, intuitive tools that make their jobs easier"
    },
    {
      icon: Check,
      title: "Unified Insights",
      description: "See your entire operation in one dashboard - sales, staff, costs, trends"
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
            Old POS Thinking vs Modern Restaurant Reality
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Problems Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              {problems.map((problem, index) => (
                <motion.div
                  key={problem.title}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <problem.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{problem.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{problem.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Modern Needs Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              {modernNeeds.map((need, index) => (
                <motion.div
                  key={need.title}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <need.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{need.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{need.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 