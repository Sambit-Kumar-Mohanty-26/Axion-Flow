import { motion } from 'framer-motion';
import { Eye, Clock, GitPullRequestClosed } from 'lucide-react';
const painPoints = [
  {
    icon: <Eye className="w-8 h-8 text-red-400" />,
    title: "Hidden Inefficiencies",
    description: "You can't fix problems you can't see. Critical bottlenecks remain invisible until it's too late.",
    glowColor: "shadow-red-500/50",
    gradientFrom: "from-red-500",
  },
  {
    icon: <Clock className="w-8 h-8 text-yellow-400" />,
    title: "Costly Delays",
    description: "Unexpected absences and machine downtime create a ripple effect of missed deadlines.",
    glowColor: "shadow-yellow-500/50",
    gradientFrom: "from-yellow-500",
  },
  {
    icon: <GitPullRequestClosed className="w-8 h-8 text-orange-400" />,
    title: "Mismatched Resources",
    description: "Is your best welder working on a low-priority task while a critical job waits?",
    glowColor: "shadow-orange-500/50",
    gradientFrom: "from-orange-500",
  },
];

const PainPointCard = ({ icon, title, description, glowColor, gradientFrom }: typeof painPoints[0]) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
      }}
      className={`relative p-8 bg-gray-800/50 rounded-2xl group transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl ${glowColor}`}
    >
      <div 
        className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-all duration-300
                    before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br ${gradientFrom} to-brand-blue
                    before:opacity-0 group-hover:before:opacity-100 before:blur-md before:transition-opacity before:duration-300`}
      />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 shadow-lg ${glowColor} mb-6 transition-shadow duration-300 group-hover:shadow-xl`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </motion.div>
  );
};

export const ProblemSection = () => {
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
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight animate-text-shimmer">
            Your Factory Floor is a <span className="text-red-500">Black Box</span>
          </h2>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-lg text-gray-400"
          >
            Without real-time visibility, you're flying blind through critical decisions that impact your entire operation.
          </motion.p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.2 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {painPoints.map((point) => (
            <PainPointCard key={point.title} {...point} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};