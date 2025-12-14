import { motion } from 'framer-motion';
import { User, Coffee, AlertCircle, HardHat } from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  employeeId?: string;
  status: 'AVAILABLE' | 'ON_TASK' | 'ON_BREAK' | 'ABSENT';
  location_x: number;
  location_y: number;
}

interface WorkerAvatarProps {
  worker: Worker;
  onClick: (worker: Worker) => void;
}

const getStatusConfig = (status: Worker['status']) => {
  switch (status) {
    case 'AVAILABLE': 
      return { color: 'bg-green-500', ring: 'ring-green-500/50', icon: <User size={14} /> };
    case 'ON_TASK': 
      return { color: 'bg-blue-500', ring: 'ring-blue-500/50', icon: <HardHat size={14} /> };
    case 'ON_BREAK': 
      return { color: 'bg-yellow-500', ring: 'ring-yellow-500/50', icon: <Coffee size={14} /> };
    case 'ABSENT': 
      return { color: 'bg-red-500', ring: 'ring-red-500/50', icon: <AlertCircle size={14} /> };
    default: 
      return { color: 'bg-gray-500', ring: 'ring-gray-500/50', icon: <User size={14} /> };
  }
};

export const WorkerAvatar = ({ worker, onClick }: WorkerAvatarProps) => {
  const config = getStatusConfig(worker.status);

  return (
    <motion.div
      layoutId={worker.id}
      onClick={() => onClick(worker)} 
      className="absolute flex flex-col items-center justify-center cursor-pointer group z-10"
      animate={{ 
        left: `${worker.location_x}%`, 
        top: `${worker.location_y}%` 
      }}
      transition={{ duration: 3, ease: "linear" }}
      style={{ width: '32px', height: '32px', marginLeft: '-16px', marginTop: '-16px' }}
    >
      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded border border-white/20 whitespace-nowrap z-20 pointer-events-none">
        {worker.name}
      </div>

      <motion.div 
        whileHover={{ scale: 1.3 }} 
        whileTap={{ scale: 0.9 }}
        className={`relative w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 border-2 border-white/10 shadow-lg ${config.ring} group-hover:ring-4 transition-all`}
      >
        <div className="text-white">{config.icon}</div>
        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-800 ${config.color}`} />
      </motion.div>
    </motion.div>
  );
};