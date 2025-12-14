import { useState, useEffect, type ReactNode } from 'react';
import apiClient from '../../api/apiClient';
import { motion } from 'framer-motion';
import { Building, Users, ListChecks, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FactoryMap } from '../../components/dashboard/FactoryMap';
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
      } catch (err) {
        setError("Failed to load dashboard data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <div className="text-center p-8">Loading Factory Dashboard...</div>;
  if (error) return <div className="text-center p-8 text-red-400">{error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Factory Overview</h1>
        <p className="text-gray-400">Welcome back, {user?.email}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-teal-400"/>} title="Active Workers" value={analytics?.activeWorkers ?? '...'} />
        <StatCard icon={<ListChecks className="text-purple-400"/>} title="Open Tasks" value={analytics?.openTasks ?? '...'} />
        <StatCard icon={<CheckCircle className="text-green-400"/>} title="Completion Rate" value={analytics?.completionRate?.toFixed(1) ?? '0'} unit="%" />
        <StatCard icon={<Building className="text-blue-400"/>} title="Factory Status" value={"Operational"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 flex flex-col h-[600px]">
          <h2 className="text-xl font-bold text-white mb-4">Live Factory Map</h2>
          <div className="flex-1 bg-gray-800/50 rounded-xl border border-white/10 p-1 relative">
             <FactoryMap initialWorkers={workers} isLoading={isLoading} />
          </div>
        </div>

        <div className="flex flex-col h-[600px]">
          <h2 className="text-xl font-bold text-white mb-4">High Priority Tasks</h2>
          <div className="flex-1 bg-gray-800/50 rounded-xl border border-white/10 p-4 overflow-hidden">
             <TaskList tasks={tasks} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};