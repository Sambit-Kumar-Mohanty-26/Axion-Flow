import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Eye, BrainCircuit, Zap } from 'lucide-react';
import { useRef } from 'react';

const steps = [
  {
    icon: <Eye />,
    title: "SEE",
    subtitle: "Live Digital Twin",
    description: "We create a real-time virtual replica of your workforce and operations. See where everyone is and what they're doing, instantly."
  },
  {
    icon: <BrainCircuit />,
    title: "PREDICT",
    subtitle: "AI-Powered Foresight",
    description: "Our AI engine runs continuous simulations to predict bottlenecks, fatigue risks, and project delays before they happen."
  },
  {
    icon: <Zap />,
    title: "ACT",
    subtitle: "Intelligent Recommendations",
    description: "When a problem arises, Axion Flow instantly recommends the best course of action, like finding the optimal worker for a critical task."
  }
];

export const HowItWorksSection = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start center", "end end"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={targetRef} className="relative bg-gray-900 text-white py-20 sm:py-32 px-4 overflow-hidden">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
            Three simple steps to transform your factory operations from reactive to predictive.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-1 bg-gray-800 rounded-full" />
          <motion.div 
            style={{ height: lineHeight }}
            className="absolute left-1/2 -translate-x-1/2 top-10 w-1 rounded-full bg-gradient-to-b from-teal-500 to-blue-500"
          >
            <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_15px_theme(colors.teal.400)]" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_15px_theme(colors.blue.400)]" />
          </motion.div>

          <div className="space-y-24">
            {steps.map((step, index) => {
              const isOdd = index % 2 !== 0;
              
              const stepProgress = useTransform(scrollYProgress, [index * 0.3, 0.1 + index * 0.3], [0, 1]);
              const opacity = useSpring(useTransform(stepProgress, [0.5, 1], [0.3, 1]));
              const scale = useSpring(useTransform(stepProgress, [0.5, 1], [0.8, 1]));
              const x = useSpring(useTransform(stepProgress, [0.5, 1], [isOdd ? 100 : -100, 0]));

              return (
                <div key={index} className="relative flex items-center justify-center">
                  <motion.div 
                    style={{ scale }}
                    className="relative z-10 w-20 h-20 flex items-center justify-center rounded-full bg-blue-600 shadow-2xl shadow-blue-500/50"
                  >
                    <span className="text-3xl font-bold">{index + 1}</span>
                    <motion.div 
                      style={{ scale: stepProgress, opacity: useTransform(stepProgress, [0.8, 1], [1, 0])}} 
                      className="absolute inset-0 rounded-full border-2 border-blue-400" 
                    />
                     <motion.div 
                      style={{ scale: useTransform(stepProgress, [0.5, 1], [0.5, 1.5]), opacity: useTransform(stepProgress, [0.5, 1], [1, 0])}} 
                      className="absolute inset-0 rounded-full border-2 border-blue-400" 
                    />
                  </motion.div>

                  <motion.div 
                    style={{ opacity, x }} 
                    className={`absolute w-[calc(50%-6rem)] ${isOdd ? 'left-0 text-right' : 'right-0 text-left'}`}
                  >
                    <div className={`inline-block ${isOdd ? 'items-end' : 'items-start'} flex flex-col`}>
                      <p className="text-lg font-bold tracking-widest uppercase">{step.title}</p>
                      <p className="text-xl font-semibold text-teal-400 mt-1">{step.subtitle}</p>
                      <p className="mt-2 text-gray-400">{step.description}</p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};