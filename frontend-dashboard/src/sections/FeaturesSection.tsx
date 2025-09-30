import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Map, Zap, Cog, Bell } from 'lucide-react';
import React from 'react';

const features = [
  {
    icon: <Map />,
    title: "Live Factory Map",
    description: "Real-time visualization of your entire workforce and operations.",
    color: "#3b82f6", 
    gridSpan: "md:col-span-2", 
  },
  {
    icon: <Zap />,
    title: "AI Task Recommendation",
    description: "Instantly find the best person for any job based on skills and availability.",
    color: "#14b8a6", 
    gridSpan: "md:col-span-1",
  },
  {
    icon: <Cog />,
    title: "\"What-If\" Simulation Engine",
    description: "Simulate the impact of new orders or staff shortages before they happen.",
    color: "#8b5cf6", 
    gridSpan: "md:col-span-1",
  },
  {
    icon: <Bell />,
    title: "Automated Alerts",
    description: "Get notified of critical events and their impact on your deadlines.",
    color: "#f59e0b", 
    gridSpan: "md:col-span-2",
  },
];

const FeatureCard = ({ icon, title, description, color, gridSpan }: typeof features[0]) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - left);
    mouseY.set(event.clientY - top);
  };
  
  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      variants={{
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
      }}
      className={`group relative p-8 rounded-2xl bg-white/5 border border-white/10 overflow-hidden ${gridSpan}`}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(200px at ${x}px ${y}px, ${color}, transparent 80%)`
          ),
        }}
      />
      
      <div className="relative z-10">
        <div className="inline-block p-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5 mb-4">
          <div style={{ color }}>{icon}</div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

export const FeaturesSection = () => {
  return (
    <section className="bg-gray-900 text-white py-20 sm:py-32 px-4">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Core Features
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
            Powerful capabilities that transform how you manage your factory operations.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.15 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};