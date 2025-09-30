import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useScramble } from 'use-scramble';
import dashboardImage from '../assets/dashboard-mockup.png';
import React from 'react';

const features = [
  { title: "Real-time Digital Twin", description: "Live visualization of your entire workforce and operations" },
  { title: "AI-Powered Predictions", description: "Anticipate bottlenecks before they impact your deadlines" },
  { title: "Intelligent Recommendations", description: "Get instant guidance on optimal resource allocation" }
];

const FeatureItem = ({ title, description }: typeof features[0]) => {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100 } } }}
      className="flex items-start gap-4"
    >
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-teal-400 mt-1"
      >
        <CheckCircle2 className="w-6 h-6" strokeWidth={1.5} />
      </motion.div>
      <div>
        <h3 className="font-bold text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
};

export const SolutionSection = () => {
  const { ref: titleRef, replay: titleReplay } = useScramble({ 
    text: "Axion Flow Gives You",
    speed: 0.6,
    tick: 1,
    step: 1,
    scramble: 5,
    seed: 2,
  });

  const { ref: subtitleRef, replay: subtitleReplay } = useScramble({ 
    text: "X-Ray Vision",
    speed: 0.6,
    tick: 1,
    step: 1,
    scramble: 5,
    seed: 2,
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-400, 400], [5, -5]);
  const rotateY = useTransform(mouseX, [-400, 400], [-5, 5]);

  const smoothRotateX = useSpring(rotateX, { stiffness: 200, damping: 30 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 200, damping: 30 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - left - width / 2);
    mouseY.set(event.clientY - top - height / 2);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative text-white py-20 sm:py-32 px-4 border-t border-b border-white/5 overflow-hidden dark-textured-bg"
      style={{ perspective: '2000px' }}
    >
      <div className="absolute inset-0 opacity-30 animate-pan-grid z-0" />
      
      <motion.div 
        style={{ rotateX: smoothRotateX, rotateY: smoothRotateY }}
        className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.2 }}
        >
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 }}}}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight"
          >
            <span ref={titleRef} onMouseOver={titleReplay} onFocus={titleReplay} />
            <br />
            <span 
              ref={subtitleRef} 
              onMouseOver={subtitleReplay} 
              onFocus={subtitleReplay}
              className="bg-gradient-to-r from-blue-500 to-teal-400 text-transparent bg-clip-text" 
            />
          </motion.div>
          
          <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.4 }}}} className="mt-4 text-lg text-teal-400 font-semibold">
            See Everything. Predict Anything. Act Instantly.
          </motion.p>
          
          <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.5 }}}} className="mt-6 text-gray-300 leading-relaxed">
            Transform your factory floor from a black box into a transparent, predictable system where every decision is backed by real-time data and AI-powered insights.
          </motion.p>

          <div className="mt-8 space-y-6">
            {features.map((feature, i) => (
              <motion.div key={feature.title} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.8 + i * 0.2 }}}}>
                <FeatureItem {...feature} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 opacity-20 blur-2xl" />
          <div className="relative p-2 rounded-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/60">
            <div className="relative rounded-lg overflow-hidden">
              <img src={dashboardImage} alt="Axion Flow Dashboard" />
              <motion.div 
                initial={{ y: "-100%" }}
                whileInView={{ y: "100%" }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              >
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-teal-300/80 to-transparent" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};