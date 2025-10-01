import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'ON_TASK' | 'ON_BREAK' | 'ABSENT';
  location_x: number;
  location_y: number;
}

interface WorkerAvatarProps {
  worker: Worker;
}

const getStatusColor = (status: Worker['status']) => {
  switch (status) {
    case 'AVAILABLE': return 'bg-green-500';
    case 'ON_TASK': return 'bg-blue-500';
    case 'ON_BREAK': return 'bg-yellow-500';
    case 'ABSENT': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const WorkerAvatar = ({ worker }: WorkerAvatarProps) => {
  const statusColor = getStatusColor(worker.status);

  return (
    <motion.div
      key={worker.id}
      className="absolute w-12 h-12 flex flex-col items-center justify-center cursor-pointer group"
      animate={{ 
        left: `${worker.location_x}%`, 
        top: `${worker.location_y}%` 
      }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      whileHover={{ scale: 1.2, zIndex: 10 }}
    >
      <div className="absolute -top-10 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {worker.name}
      </div>

      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center border-2 border-white/50">
        <User size={16} />
      </div>

      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${statusColor}`} />
    </motion.div>
  );
};