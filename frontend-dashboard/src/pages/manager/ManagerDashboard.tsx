import { useState, useEffect, type ReactNode } from 'react';
import apiClient from '../../api/apiClient';
import { motion } from 'framer-motion';
import { Building, Users, ListChecks, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FactoryMap } from '../../components/dashboard/FactoryMap';
import { useSocket } from '../../context/SocketContext';
import { TaskList } from '../../components/dashboard/TaskList'; 

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

        console.log("Fetched Workers:", workersRes.data);
        console.log("Fetched Tasks:", tasksRes.data);

      } catch (err) {
        setError("Failed to load dashboard data. Please refresh the page.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

   useEffect(() => {
    const handleWorkerUpdate = (updatedWorker: any) => {
      console.log('Received worker:update event:', updatedWorker);
      setWorkers(prevWorkers => 
        prevWorkers.map(w => w.id === updatedWorker.id ? updatedWorker : w)
      );
    };

    const handleTaskUpdate = (updatedTask: any) => {
      console.log('Received task:update event:', updatedTask);
      setTasks(prevTasks =>
        prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t)
      );
    };

    socket.on('worker:update', handleWorkerUpdate);
    socket.on('task:update', handleTaskUpdate);

    return () => {
      socket.off('worker:update', handleWorkerUpdate);
      socket.off('task:update', handleTaskUpdate);
    };
  }, [socket]);


  if (isLoading) {
    return <div className="text-center p-8">Loading Factory Dashboard...</div>;
  }
  if (error) {
    return <div className="text-center p-8 text-red-400">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-2">Factory Overview</h1>
      <p className="text-gray-400 mb-6">Welcome back, {user?.email}. Here's what's happening in your factory today.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-teal-400"/>} title="Active Workers" value={analytics?.activeWorkers ?? '...'} />
        <StatCard icon={<ListChecks className="text-purple-400"/>} title="Open Tasks" value={analytics?.openTasks ?? '...'} />
        <StatCard icon={<CheckCircle className="text-green-400"/>} title="Completion Rate" value={analytics?.completionRate.toFixed(1) ?? '...'} unit="%" />
        <StatCard icon={<Building className="text-blue-400"/>} title="Factory Status" value={"Operational"} />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-gray-800/50 rounded-xl border border-white/10 p-4">
          <h2 className="font-bold text-white">Live Factory Map</h2>
          <div className="flex items-center justify-center h-full text-gray-500">
             <FactoryMap workers={workers} isLoading={isLoading} />
          </div>
        </div>
        <div className="min-h-[500px] bg-gray-800/50 rounded-xl border border-white/10 p-4">
          <h2 className="font-bold text-white">High Priority Tasks</h2>
          <div className="flex items-center justify-center h-full text-gray-500">
             <TaskList tasks={tasks} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};