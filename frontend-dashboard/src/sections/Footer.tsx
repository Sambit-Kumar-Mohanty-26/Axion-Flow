import { motion } from 'framer-motion';
import { Linkedin, Twitter, Github, Phone, Mail, MapPin, Zap } from 'lucide-react';
import { Button } from '../components/Button'; 

const footerLinks = {
  product: ["Features", "Digital Twin", "AI Predictions", "Integrations", "Security"],
  company: ["About Us", "Careers", "Blog", "Case Studies", "Press"],
  contact: [
    { icon: <Phone size={16} />, text: "+1 (555) 123-4567" },
    { icon: <Mail size={16} />, text: "hello@axionflow.com" },
    { icon: <MapPin size={16} />, text: "San Francisco, CA" },
  ]
};

const socialLinks = [
  { icon: <Linkedin size={20} />, href: "#" },
  { icon: <Twitter size={20} />, href: "#" },
  { icon: <Github size={20} />, href: "#" },
];


export const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative bg-gray-900 border-t border-white/10 text-gray-400 pt-16 sm:pt-24 pb-8 px-4 overflow-hidden"
    >
      <div className="absolute inset-0 starlight-bg opacity-20 z-0" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600">
                <Zap className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">Axion Flow</span>
            </a>
            <p className="max-w-xs text-sm leading-relaxed">
              Transform your factory floor from chaos into predictable flow with AI-powered digital twins.
            </p>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((link, index) => (
                <motion.a 
                  key={index}
                  href={link.href}
                  whileHover={{ scale: 1.2, color: "#14b8a6" }} 
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="text-gray-500"
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map(link => <li key={link}><a href="#" className="hover:text-teal-400 transition-colors">{link}</a></li>)}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map(link => <li key={link}><a href="#" className="hover:text-teal-400 transition-colors">{link}</a></li>)}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-4">
              {footerLinks.contact.map(item => (
                <li key={item.text} className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button variant="primary">Request Demo →</Button>
            </div>
          </div>
        </div>

        <div className="mt-16 sm:mt-24 pt-8 border-t border-white/10 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Axion Flow. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};