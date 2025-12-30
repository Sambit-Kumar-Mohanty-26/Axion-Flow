import { useState, useEffect, type ReactNode } from 'react';
import apiClient from '../../api/apiClient';
import { motion } from 'framer-motion';
import { Building, Users, ListChecks, CheckCircle, Plus, Wrench, History, Activity, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FactoryMap } from '../../components/dashboard/FactoryMap';
import { TaskList } from '../../components/dashboard/TaskList';
import { useSocket } from '../../context/SocketContext';
import { CreateTaskModal } from '../../components/modals/CreateTaskModal';
import { ManageSkillsModal } from '../../components/modals/ManageSkillsModal';
import { useToast } from '../../components/ui/Toast';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: number | string;
  unit?: string;
}
const StatCard = ({ icon, title, value, unit = '' }: StatCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-800/50 p-6 rounded-xl border border-white/10"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gray-700 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white">{value}<span className="text-lg">{unit}</span></p>
      </div>
    </div>
  </motion.div>
);

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [analytics, setAnalytics] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState<'LIVE' | 'REPLAY' | 'HEATMAP'>('LIVE');
  const [replayFrames, setReplayFrames] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<number[][] | null>(null);
  const [replayIndex, setReplayIndex] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, workersRes, tasksRes] = await Promise.all([
          apiClient.get('/dashboard/factory-analytics'),
          apiClient.get('/workers'),
          apiClient.get('/tasks'),
        ]);
        
        setAnalytics(analyticsRes.data);
        setWorkers(workersRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!socket || viewMode !== 'LIVE') return;

    const handleTaskCreate = (newTask: any) => setTasks(prev => [newTask, ...prev]);
    const handleTaskUpdate = (updatedTask: any) => setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    const handleWorkerUpdate = (updatedWorker: any) => setWorkers(prev => prev.map(w => w.id === updatedWorker.id ? updatedWorker : w));
    const handleSOS = (data: any) => {
        const audio = new Audio('/sounds/sos.wav');
         audio.play().catch(error => console.warn("Audio play blocked:", error));
        showToast(`🚨 SOS: ${data.name} needs help! Location: [${data.location.x.toFixed(0)}, ${data.location.y.toFixed(0)}]`, 'error');
    };

    socket.on('task:create', handleTaskCreate);
    socket.on('task:update', handleTaskUpdate);
    socket.on('worker:update', handleWorkerUpdate);
    socket.on('manager:sos-alert', handleSOS); 

    return () => {
        socket.off('task:create', handleTaskCreate);
        socket.off('task:update', handleTaskUpdate);
        socket.off('worker:update', handleWorkerUpdate);
        socket.off('manager:sos-alert', handleSOS);
    };
  }, [socket, viewMode]);

  const processReplayData = (logs: any[]) => {
    if (!logs || logs.length === 0) return [];

    const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const frames: any[] = [];
    const workerStateMap = new Map<string, any>();
    const getBucketTime = (isoString: string) => {
      const date = new Date(isoString);
      const ms = date.getTime();
      return Math.floor(ms / 3000) * 3000;
    };

    let currentBucketTime = getBucketTime(sortedLogs[0].timestamp);

    sortedLogs.forEach((log) => {
      const logTime = getBucketTime(log.timestamp);

      if (logTime > currentBucketTime) {
        frames.push({
          timestamp: new Date(currentBucketTime).toISOString(),
          workers: Array.from(workerStateMap.values())
        });
        currentBucketTime = logTime;
      }

      const liveWorkerInfo = workers.find(w => w.id === log.workerId);
      
      workerStateMap.set(log.workerId, {
        id: log.workerId,
        name: liveWorkerInfo ? liveWorkerInfo.name : "Recorded Worker",
        status: log.status,
        location_x: log.x,
        location_y: log.y,
        employeeId: liveWorkerInfo ? liveWorkerInfo.employeeId : "HIST"
      });
    });

    frames.push({
      timestamp: new Date(currentBucketTime).toISOString(),
      workers: Array.from(workerStateMap.values())
    });

    return frames;
  };
  const loadReplay = async () => {
    setViewMode('REPLAY');
    setHeatmapData(null);
    try {
      const res = await apiClient.get('/analytics/replay?minutes=2880');
      const frames = processReplayData(res.data);
      
      setReplayFrames(frames);
      setReplayIndex(0);
    } catch (err) {
      console.error("Failed to load replay", err);
    }
  };

  const loadHeatmap = async () => {
    setViewMode('HEATMAP');
    try {
      const res = await apiClient.get('/analytics/heatmap');
      setHeatmapData(res.data);
    } catch (err) {
      console.error("Failed to load heatmap", err);
    }
  };

  const switchToLive = () => {
    setViewMode('LIVE');
    setHeatmapData(null);
    apiClient.get('/workers').then(res => setWorkers(res.data));
  };

  useEffect(() => {
    let interval: any;
    if (viewMode === 'REPLAY' && replayFrames.length > 0) {
      interval = setInterval(() => {
        setReplayIndex(prev => {
            if (prev >= replayFrames.length - 1) return prev;
            return prev + 1;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [viewMode, replayFrames]);

  const getMapWorkers = () => {
    if (viewMode === 'REPLAY' && replayFrames.length > 0) {
      return replayFrames[replayIndex]?.workers || [];
    }
    return workers;
  };

  const formatReplayTime = (timestamp: string) => {
    if (!timestamp) return 'Loading...';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }); 
  };


  if (isLoading) return <div className="text-center p-8 text-gray-400">Loading Factory Dashboard...</div>;
  if (error) return <div className="text-center p-8 text-red-400">{error}</div>;

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold mb-2 text-white">Factory Overview</h1>
            <p className="text-gray-400">Welcome back, {user?.email}.</p>
        </div>

        <div className="flex gap-2 bg-gray-800 p-1 rounded-lg border border-white/10">
            <button 
                onClick={switchToLive}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'LIVE' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700'}`}
            >
                <Activity size={14} /> LIVE
            </button>
            <button 
                onClick={loadReplay}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'REPLAY' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700'}`}
            >
                <History size={14} /> REPLAY
            </button>
            <button 
                onClick={loadHeatmap}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'HEATMAP' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700'}`}
            >
                <Layers size={14} /> HEATMAP
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-teal-400"/>} title="Active Workers" value={analytics?.activeWorkers ?? '...'} />
        <StatCard icon={<ListChecks className="text-purple-400"/>} title="Open Tasks" value={analytics?.openTasks ?? '...'} />
        <StatCard icon={<CheckCircle className="text-green-400"/>} title="Completion Rate" value={analytics?.completionRate?.toFixed(1) ?? '0'} unit="%" />
        <StatCard icon={<Building className="text-blue-400"/>} title="Factory Status" value={"Operational"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-white">
                {viewMode === 'LIVE' ? 'Live Factory Map' : viewMode === 'REPLAY' ? 'Historical Playback' : 'Traffic Heatmap'}
             </h2>
             
             {viewMode === 'REPLAY' && replayFrames.length > 0 && (
                <div className="flex items-center gap-4 bg-gray-800 px-4 py-2 rounded-full border border-white/10 shadow-lg">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Historical Playback</span>
                        <span className="text-sm text-blue-400 font-mono font-bold whitespace-nowrap">
                            {formatReplayTime(replayFrames[replayIndex]?.timestamp)}
                        </span>
                    </div>
                    <input 
                        type="range" min="0" max={replayFrames.length - 1} 
                        value={replayIndex} 
                        onChange={(e) => setReplayIndex(Number(e.target.value))}
                        className="w-48 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
             )}
          </div>

          <div className="flex-1 bg-gray-800/50 rounded-xl border border-white/10 p-1 relative">
             <FactoryMap 
                initialWorkers={getMapWorkers()} 
                isLoading={isLoading} 
                heatmapData={viewMode === 'HEATMAP' ? heatmapData : null}
                isReplay={viewMode === 'REPLAY'}
             />
          </div>
        </div>

        <div className="flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">High Priority Tasks</h2>
            <div className="flex gap-2">
              <button 
                  onClick={() => setIsSkillsModalOpen(true)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors border border-white/10"
                  title="Manage Skills"
              >
                  <Wrench size={20} />
              </button>

              <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors shadow-lg shadow-blue-500/20"
                  title="Create New Task"
              >
                  <Plus size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-gray-800/50 rounded-xl border border-white/10 p-4 overflow-hidden">
             <TaskList tasks={tasks} />
          </div>
        </div>
      </div>
    </motion.div>

    <CreateTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
    />
    <ManageSkillsModal 
        isOpen={isSkillsModalOpen} 
        onClose={() => setIsSkillsModalOpen(false)} 
    />
    </>
  );
};