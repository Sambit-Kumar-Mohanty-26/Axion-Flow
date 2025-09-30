import { motion, useMotionValue, useSpring } from 'framer-motion';
import React, { useRef } from 'react';

const MagneticButton = () => {
  const ref = useRef<HTMLButtonElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 200 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);
    mouseX.set(x * 0.2);
    mouseY.set(y * 0.2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="relative px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-xl shadow-2xl shadow-blue-500/50 transition-all duration-300 ease-in-out transform hover:scale-105"
    >
      <span className="flex items-center gap-2">
        Request a Demo
        <motion.span 
          initial={{ x: 0 }}
          whileHover={{ x: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          →
        </motion.span>
      </span>
    </motion.button>
  );
};

export const CTASection = () => {
  return (
    <section className="relative bg-gray-900 text-white py-20 sm:py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 animate-aurora-cta z-0" />
      
      <div className="container mx-auto text-center relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ staggerChildren: 0.3 }}
        >
          <motion.h2 
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' }}
            }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight"
          >
            Stop Guessing. Start{' '}
            <span className="animate-text-shimmer">
              Optimizing
            </span>
          </motion.h2>

          <motion.p 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' }}
            }}
            className="mt-6 max-w-xl mx-auto text-lg text-gray-400"
          >
            See how Axion Flow can increase your plant's productivity by up to 25%. Schedule a personalized demo with our team today.
          </motion.p>
          
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 150, damping: 20 }}
            }}
            className="mt-10"
          >
            <MagneticButton />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};