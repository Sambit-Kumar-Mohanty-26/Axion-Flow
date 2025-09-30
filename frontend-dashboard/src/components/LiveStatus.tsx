import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const statuses = [
  "// MONITORING 342 ASSETS...",
  "// ANALYZING WORKFLOW DATA...",
  "// PREDICTING BOTTLENECKS...",
  "// OPTIMIZING TASK QUEUE...",
];

export const LiveStatus = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % statuses.length);
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 font-mono text-xs text-teal-400/70">
      <motion.div
        className="w-2 h-2 bg-teal-400 rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <AnimatePresence mode="wait">
        <motion.span
          key={statuses[index]}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
        >
          {statuses[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};