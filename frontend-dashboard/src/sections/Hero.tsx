import { useState } from 'react';
import { motion, useMotionValue, useTransform, type Variants } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Link } from 'react-router-dom';

import { Button } from '../components/Button';
import { LiveStatus } from '../components/LiveStatus';
import logo from '../assets/logo.png';
import heroImage from '../assets/hero-image.png';

export const Hero = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = ['Features', 'How It Works', 'About', 'Contact'];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [- window.innerHeight / 2, window.innerHeight / 2], [5, -5]);
  const rotateY = useTransform(mouseX, [- window.innerWidth / 2, window.innerWidth / 2], [-5, 5]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left - width / 2;
    const y = clientY - top - height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };


  return (
    
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen bg-gray-900 text-white overflow-hidden"
      style={{ perspective: '1000px' }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>
      <div aria-hidden="true" className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/30 rounded-full filter blur-3xl animate-blob-spin"></div>
      <div aria-hidden="true" className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-500/30 rounded-full filter blur-3xl animate-blob-spin" style={{ animationDelay: '4s', animationDuration: '25s' }}></div>

      <motion.header /* ... */ className="absolute top-0 left-0 w-full z-30 py-4 px-4 sm:px-8">
        <div className="container mx-auto flex justify-between items-center">
          <a href="#" className="flex items-center gap-3"><img src={logo} alt="Axion Flow Logo" className="h-8 w-8" /><span className="text-xl font-bold">Axion Flow</span></a>
          <nav className="hidden md:flex items-center space-x-6 text-sm">{navLinks.map(link => <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-blue-400 transition-colors">{link}</a>)}</nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-sm font-semibold hover:text-blue-400 transition-colors">
              Sign In
            </Link>
            <Link to="/signup">
              <Button variant="primary">Request Demo</Button>
            </Link>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none p-2" aria-label="Open menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-4 6h4" /></svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="md:hidden mt-4 bg-gray-800/95 rounded-lg p-4 flex flex-col items-center space-y-4">
                {navLinks.map(link => <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-blue-400 transition-colors block w-full text-center py-2">{link}</a>)}
                <Link to="/login" className="w-full text-center py-2 font-semibold">Sign In</Link>
                <Link to="/signup" className="w-full"><Button variant="primary" className="w-full">Request Demo</Button></Link>
            </motion.div>
        )}
      </motion.header>

      <div className="relative z-20 container mx-auto flex items-center min-h-screen px-4">
        <motion.div style={{ rotateX, rotateY }} className="w-full lg:w-3/5 text-center lg:text-left" variants={containerVariants} initial="hidden" animate="visible">
          <motion.p variants={itemVariants} className="text-teal-400 font-semibold text-sm tracking-widest uppercase">
            THE INTELLIGENT HEART OF YOUR FACTORY FLOOR
          </motion.p>
          <motion.h1 variants={itemVariants} className="mt-4 text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tighter">
            Transform Factory <br />
            <span className="text-teal-400">Chaos</span> into <br />
            <TypeAnimation
              sequence={[
                'Predictable Flow', 2000,
                'Optimized Flow', 2000,
                'Intelligent Flow', 2000,
              ]}
              wrapper="span"
              speed={30}
              repeat={Infinity}
              cursor={true}
              className="bg-gradient-to-r from-blue-500 to-teal-400 text-transparent bg-clip-text"
            />
          </motion.h1>
          <motion.p variants={itemVariants} className="mt-6 max-w-xl mx-auto lg:mx-0 text-gray-300 text-lg">
            Axion Flow is an AI-driven digital twin that gives you real-time visibility, predicts operational bottlenecks, and prescribes the optimal action to maximize productivity.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8">
            <LiveStatus />
          </motion.div>
          <motion.div variants={itemVariants} className="mt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link to="/login">
                <Button variant="primary">
                <span className="flex items-center gap-2">Request a Demo <span className="group-hover:translate-x-1 transition-transform">→</span></span>
                </Button>
            </Link>
            <Button variant="secondary">See It In Action</Button>
          </motion.div>
        </motion.div>
        <motion.div style={{ rotateX, rotateY }} className="hidden lg:flex w-2/5 items-center justify-center">
          <div className="w-full max-w-md rounded-2xl shadow-2xl shadow-blue-500/20 overflow-hidden">
            <motion.img 
              src={heroImage} 
              alt="Axion Flow Data Visualization" 
              className="w-full object-cover" 
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};