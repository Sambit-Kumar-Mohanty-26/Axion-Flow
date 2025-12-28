import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ListTodo, Clock, Sparkles, CheckCircle, Trash2, Loader2, Users } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useToast } from '../ui/Toast';
import { useSocket } from '../../context/SocketContext';
import { ConfirmationModal } from '../modals/ConfirmationModal';

interface Worker { name: string; }

interface Task {
  id: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  workers?: Worker[];
  assignedWorker?: any;
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

export const TaskList = ({ tasks: initialTasks }: TaskListProps) => {
  const { showToast } = useToast();
  const socket = useSocket();
  const [localTasks, setLocalTasks] = useState<Task[]>(initialTasks);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [aiStats, setAiStats] = useState<Record<string, string>>({}); 

  useEffect(() => {
    setLocalTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    if(!socket) return;
    
    socket.on('task:update', (updatedTask: Task) => {
      setLocalTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    });

    socket.on('task:delete', (data: { id: string }) => {
        setLocalTasks(prev => prev.filter(t => t.id !== data.id));
    });
    
    return () => { 
        socket.off('task:delete'); 
        socket.off('task:update');
    };
  }, [socket]);

  const handleAutoAssign = async (taskId: string) => {
    setLoadingId(taskId);
    try {
      const response = await apiClient.post(`/tasks/${taskId}/assign-recommended`);
      showToast(response.data.message, 'success');

      if (response.data.aiDetails) {
        setAiStats(prev => ({
            ...prev,
            [taskId]: response.data.aiDetails.confidence
        }));
      }

    } catch (error: any) {
      showToast(error.response?.data?.message || 'AI assignment failed.', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await apiClient.patch(`/tasks/${taskId}/status`, { status: 'COMPLETED' });
      showToast('Task marked as completed', 'success');
    } catch (error) {
      showToast('Failed to complete task', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await apiClient.delete(`/tasks/${taskToDelete}`);
      setLocalTasks(prev => prev.filter(t => t.id !== taskToDelete));
      showToast('Task deleted', 'success');
      setTaskToDelete(null); 
    } catch (error) {
      showToast('Failed to delete task', 'error');
    }
  };

  const sortedTasks = [...localTasks].sort((a, b) => {
      if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
      if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
      return 0;
  });

  if (sortedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <ListTodo size={48} />
        <p className="mt-4">No tasks found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 overflow-y-auto h-full pr-2">
        {sortedTasks.map((task) => {
          const priorityStyles = getPriorityStyles(task.priority);
          const isCompleted = task.status === 'COMPLETED';
          const hasWorkers = task.workers && task.workers.length > 0;
          
          const workerNames = hasWorkers 
            ? task.workers?.map(w => w.name).join(', ') 
            : "Unassigned";

          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isCompleted ? 0.6 : 1, x: 0 }}
              className={`p-3 rounded-lg border-l-4 ${priorityStyles.border} flex flex-col gap-3 group ${
                isCompleted ? 'bg-gray-900/30' : 'bg-gray-900/50'
              }`}
            >
              <div className="flex justify-between items-start">
                  <div className="flex-1">
                      <p className={`font-semibold text-sm mb-1 ${isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                          {task.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                          <span className={`font-bold ${priorityStyles.text}`}>{task.priority}</span>
                          
                          <div className="flex items-center gap-1">
                            {hasWorkers ? <Users size={12} /> : <Clock size={12} />}
                            <span className="truncate max-w-[120px]" title={workerNames}>
                                {workerNames}
                            </span>
                          </div>

                          {!isCompleted && hasWorkers && aiStats[task.id] && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded text-[10px] text-purple-400 font-medium animate-pulse" title="AI Match Confidence">
                                  <Sparkles size={10} />
                                  <span>{aiStats[task.id]} Match</span>
                              </div>
                          )}

                      </div>
                  </div>
                  {isCompleted && <CheckCircle size={20} className="text-green-500" />}
              </div>

              {task.status === 'IN_PROGRESS' && (
                <div className="w-full">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>In Progress</span>
                        <span>{task.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
              )}

              <div className="flex gap-2 justify-end border-t border-white/5 pt-2">
                  <button 
                      onClick={() => setTaskToDelete(task.id)} 
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                      title="Delete Task"
                  >
                      <Trash2 size={16} />
                  </button>

                  {!isCompleted && (
                    <>
                      <button 
                          onClick={() => handleComplete(task.id)}
                          className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-green-400/10 rounded transition-colors flex items-center gap-1 text-xs font-medium"
                      >
                          <CheckCircle size={16} /> Complete
                      </button>

                      <button
                          onClick={() => handleAutoAssign(task.id)}
                          disabled={loadingId === task.id}
                          className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-md transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                          {loadingId === task.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                          {hasWorkers ? "ADD HELPER" : "AUTO-ASSIGN"}
                      </button>
                    </>
                  )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <ConfirmationModal 
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message="Are you sure? This task will be removed permanently from the history."
      />
    </>
  );
};