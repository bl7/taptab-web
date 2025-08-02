'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  ArrowRight
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Demo', href: '/demo' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Documentation', href: '/docs' },
      { name: 'Status', href: '/status' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' },
    ]
  };

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
  ];

  return (
    <footer className="bg-black text-white relative z-20">
      {/* Newsletter Section - ABOVE the main footer */}
      <div className=" py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">Stay Updated</h3>
            <p className="text-[#6A6A6A] mb-6 max-w-md mx-auto">
              Get the latest updates on new features, restaurant tips, and industry insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-[#1A1A1A] text-white placeholder-[#6A6A6A] focus:outline-none focus:ring-2 focus:ring-[#FF4B30] border border-[#333]"
              />
              <button className="bg-[#FF4B30] hover:bg-[#E63E29] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Image 
                src="/logo.png" 
                alt="TapTab POS Logo" 
                width={120} 
                height={40}
                className="rounded-lg"
              />
            </div>
            <p className="text-[#6A6A6A] mb-6 max-w-md">
              Revolutionize your restaurant operations with smart QR ordering, 
              real-time management, and seamless kitchen communication.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center hover:bg-[#FF4B30] transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-[#6A6A6A] hover:text-[#FF4B30] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-[#6A6A6A] hover:text-[#FF4B30] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-[#6A6A6A] hover:text-[#FF4B30] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-[#6A6A6A] hover:text-[#FF4B30] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 pt-8 border-t border-[#333]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-[#FF4B30]" />
              <div>
                <p className="text-sm text-[#6A6A6A]">Email</p>
                <p className="text-white">hello@taptabpos.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-[#FF4B30]" />
              <div>
                <p className="text-sm text-[#6A6A6A]">Phone</p>
                <p className="text-white">+44 20 1234 5678</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-[#FF4B30]" />
              <div>
                <p className="text-sm text-[#6A6A6A]">Address</p>
                <p className="text-white">London, UK</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#1A1A1A] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#6A6A6A] text-sm">
              © {currentYear} TapTab POS. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-[#6A6A6A] hover:text-[#FF4B30] text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[#6A6A6A] hover:text-[#FF4B30] text-sm transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-[#6A6A6A] hover:text-[#FF4B30] text-sm transition-colors duration-200">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 