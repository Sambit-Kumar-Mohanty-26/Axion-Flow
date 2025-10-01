import { motion } from 'framer-motion';
import { ListTodo, User, Clock } from 'lucide-react';

interface Task {
  id: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedWorker?: { name: string } | null;
}

interface TaskListProps {
  tasks: Task[];
}

const getPriorityStyles = (priority: Task['priority']) => {
  switch (priority) {
    case 'CRITICAL': return { border: 'border-red-500', text: 'text-red-400' };
    case 'HIGH': return { border: 'border-orange-500', text: 'text-orange-400' };
    case 'MEDIUM': return { border: 'border-yellow-500', text: 'text-yellow-400' };
    default: return { border: 'border-gray-600', text: 'text-gray-400' };
  }
};

export const TaskList = ({ tasks }: TaskListProps) => {
  const highPriorityTasks = tasks.filter(task => 
    (task.priority === 'CRITICAL' || task.priority === 'HIGH') && task.status !== 'COMPLETED'
  );

  if (highPriorityTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <ListTodo size={48} />
        <p className="mt-4">No high-priority tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto h-full pr-2">
      {highPriorityTasks.map((task, index) => {
        const priorityStyles = getPriorityStyles(task.priority);
        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 bg-gray-900/50 rounded-lg border-l-4 ${priorityStyles.border}`}
          >
            <p className="font-semibold text-white text-sm">{task.description}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
              <span className={`font-bold ${priorityStyles.text}`}>{task.priority}</span>
              <div className="flex items-center gap-1">
                {task.assignedWorker ? <User size={12} /> : <Clock size={12} />}
                <span>{task.assignedWorker ? task.assignedWorker.name : task.status}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};