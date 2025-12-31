import { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  ListTodo, Clock, PlayCircle, PauseCircle, CheckCircle, 
  Zap, AlertTriangle, TrendingUp, MapPin, ScanFace, LogOut
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { SafetyCheckModal } from '../../components/modals/SafetyCheckModal';

interface Task {
  id: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  assignedWorkerId?: string;
}

interface Worker {
  id: string;
  name: string;
  employeeId: string;
  status: 'AVAILABLE' | 'ON_TASK' | 'ON_BREAK' | 'ABSENT';
  fatigueLevel: number;
  location_x: number;
  location_y: number;
  lastSafetyCheck?: string;
  safetyStatus?: 'SAFE' | 'AT_RISK' | 'UNKNOWN';
  userId?: string;
  factoryId: string;
}

export const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const socket = useSocket();
  
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myProfile, setMyProfile] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);
  
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  const fetchWorkerData = async () => {
    try {
      const [workersRes, tasksRes] = await Promise.all([
        apiClient.get('/workers'),
        apiClient.get('/tasks')
      ]);

      const allWorkers: Worker[] = workersRes.data;
      const allTasks: Task[] = tasksRes.data;

      let profile = allWorkers.find(w => 
        (w.userId && w.userId === user?.userId) || 
        (w.employeeId && w.employeeId === user?.userId)
      );

      if (!profile) {
        profile = allWorkers.find(w => w.name === "Maria");
      }
      
      if (!profile && allWorkers.length > 0) {
        profile = allWorkers[0];
      }

      setMyProfile(profile || null);

      if (profile) {
        const myActive = allTasks.filter(t => 
          t.assignedWorkerId === profile.id && 
          t.status !== 'COMPLETED'
        );
        setMyTasks(myActive);

        const myDone = allTasks.filter(t => 
            t.assignedWorkerId === profile.id && 
            t.status === 'COMPLETED'
        );
        setCompletedToday(myDone.length);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();
    const interval = setInterval(fetchWorkerData, 3000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (myProfile && !myProfile.lastSafetyCheck && !isLoading) {
       setIsSafetyModalOpen(true);
    }
  }, [myProfile, isLoading]);


  const handleStatusChange = async (newStatus: Worker['status']) => {
    if (!myProfile) return;
    try {
      await apiClient.put(`/workers/${myProfile.id}/status`, { status: newStatus });
      fetchWorkerData(); 
      showToast(`Status updated: ${newStatus.replace('_', ' ')}`, 'success');
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
        await apiClient.patch(`/tasks/${taskId}/status`, { status: 'COMPLETED' });
        showToast("Task Complete! Great work.", "success");
        fetchWorkerData();
    } catch (error) {
        showToast("Failed to complete task", "error");
    }
  };

  const handleSOS = () => {
      if (!socket || !myProfile) return;
      socket.emit('worker:sos', { 
          workerId: myProfile.id, 
          name: myProfile.name, 
          location: { x: myProfile.location_x, y: myProfile.location_y },
          factoryId: myProfile.factoryId
      });
      showToast("🚨 SOS Signal Sent to Manager!", "error");
  };

  if (isLoading) return <div className="text-center p-8 text-gray-400 animate-pulse">Loading Dashboard...</div>;
  if (!myProfile) return <div className="text-center p-8 text-red-400">Worker profile not found. Please contact manager.</div>;

  const energyLevel = Math.max(0, 100 - (myProfile.fatigueLevel * 100));
  const energyColor = energyLevel > 50 ? 'bg-green-500' : energyLevel > 20 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-10">
      
      {myProfile.safetyStatus === 'AT_RISK' && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={24} />
            <div>
                <h3 className="font-bold text-red-500">Safety Violation Detected</h3>
                <p className="text-sm text-red-300">You are logged in without full PPE compliance.</p>
            </div>
        </div>
      )}

      <div className="bg-gray-800/80 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg relative">
                    {myProfile.name.charAt(0)}
                    {myProfile.lastSafetyCheck && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-gray-800" title="Safety Compliant">
                            <CheckCircle size={12} className="text-white" />
                        </div>
                    )}
                </div>
            </div>
            
            <div>
                <h1 className="text-2xl font-bold text-white">{myProfile.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="bg-gray-700 px-2 py-0.5 rounded text-white font-mono">ID: {myProfile.employeeId}</span>
                    <span className="flex items-center gap-1 text-xs"><MapPin size={10} /> Floor 1</span>
                </div>
            </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto justify-center">
             <button 
                onClick={() => setIsSafetyModalOpen(true)}
                className={`p-3 rounded-xl border transition-all ${myProfile.lastSafetyCheck ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg'}`}
                title="Perform Safety Check"
             >
                <ScanFace size={20} />
             </button>

             {myProfile.status === 'ON_BREAK' ? (
                <button onClick={() => handleStatusChange('AVAILABLE')} className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg">
                    <PlayCircle size={20} /> Resume
                </button>
             ) : (
                <button onClick={() => handleStatusChange('ON_BREAK')} className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-bold transition-all border border-white/10">
                    <PauseCircle size={20} /> Break
                </button>
             )}
             
             <button onClick={handleSOS} className="p-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/50 transition-colors shadow-lg" title="EMERGENCY SOS">
                 <AlertTriangle size={20} />
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="space-y-6">
            <div className="bg-gray-800/50 p-5 rounded-xl border border-white/10">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-gray-400 text-sm font-bold uppercase flex items-center gap-2"><Zap size={14} className="text-yellow-400"/> Energy</h3>
                    <span className="text-2xl font-mono font-bold text-white">{energyLevel.toFixed(0)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${energyLevel}%` }} className={`h-full ${energyColor}`} />
                </div>
                <p className="text-xs text-gray-500 mt-2">Fatigue monitoring active</p>
            </div>

            <div className="bg-gray-800/50 p-5 rounded-xl border border-white/10">
                <h3 className="text-gray-400 text-sm font-bold uppercase mb-2 flex items-center gap-2"><TrendingUp size={14} className="text-blue-400"/> Performance</h3>
                <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-white">{completedToday}</span>
                    <span className="text-sm text-gray-400 leading-tight">Tasks<br/>Done</span>
                </div>
            </div>
            
            <button onClick={logout} className="w-full py-3 bg-gray-800/50 hover:bg-red-900/20 text-gray-400 hover:text-red-400 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-colors">
                <LogOut size={16} /> Sign Out
            </button>
        </div>

        <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ListTodo /> Assigned Tasks</h2>
            
            {myTasks.length > 0 ? (
                <div className="space-y-4">
                    {myTasks.map((task) => (
                        <motion.div 
                            key={task.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`p-5 rounded-xl border-l-4 ${task.status === 'IN_PROGRESS' ? 'bg-blue-900/20 border-blue-500' : 'bg-gray-800/50 border-gray-600'} relative overflow-hidden`}
                        >
                            <div className="flex justify-between items-start z-10 relative">
                                <div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${task.priority === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                        {task.priority} PRIORITY
                                    </span>
                                    <h3 className="text-lg font-bold text-white mt-2">{task.description}</h3>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                                        <Clock size={14} /> 
                                        <span>Status: <span className="text-blue-400 font-bold">{task.status.replace('_', ' ')}</span></span>
                                    </div>
                                </div>

                                {task.status === 'IN_PROGRESS' ? (
                                    <button onClick={() => handleCompleteTask(task.id)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg transition-transform active:scale-95">
                                        <CheckCircle size={18} /> Done
                                    </button>
                                ) : (
                                    <div className="text-xs text-gray-500 font-mono bg-black/20 px-2 py-1 rounded">Pending</div>
                                )}
                            </div>
                            
                            {task.status === 'IN_PROGRESS' && (
                                <div className="absolute bottom-0 left-0 h-1 bg-blue-500/50 transition-all duration-1000" style={{ width: `${task.progress}%` }} />
                            )}
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center bg-gray-800/20 rounded-xl border-2 border-dashed border-gray-700 text-gray-500">
                    <CheckCircle size={48} className="mb-4 opacity-20" />
                    <p className="font-semibold">All caught up!</p>
                </div>
            )}
        </div>

      </div>
    </motion.div>

    {myProfile && (
        <SafetyCheckModal 
            isOpen={isSafetyModalOpen}
            onClose={() => setIsSafetyModalOpen(false)}
            workerId={myProfile.id}
            onSuccess={(status) => {
                fetchWorkerData();
                showToast(status === 'SAFE' ? "Safety Verified" : "Logged as At Risk", status === 'SAFE' ? "success" : "error");
            }}
        />
    )}
    </>
  );
};