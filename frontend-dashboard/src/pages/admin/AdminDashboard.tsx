import { useState, useEffect, type ReactNode } from 'react'; // 1. IMPORT ReactNode
import apiClient from '../../api/apiClient';
import { motion } from 'framer-motion';
import { Building, Users, ListChecks, CheckCircle } from 'lucide-react';

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

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiClient.get('/dashboard/org-analytics');
        setAnalytics(response.data);
      } catch (error) {
        console.error("Failed to fetch organization analytics", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
        <div className="text-center p-8 text-gray-400">Loading analytics...</div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Organization Overview</h1>
      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Building className="text-blue-400"/>} title="Total Factories" value={analytics.factoryCount} />
            <StatCard icon={<Users className="text-teal-400"/>} title="Total Workers" value={analytics.workerCount} />
            <StatCard icon={<ListChecks className="text-purple-400"/>} title="Total Tasks" value={analytics.totalTasks} />
            <StatCard icon={<CheckCircle className="text-green-400"/>} title="Completion Rate" value={analytics.completionRate.toFixed(1)} unit="%" />
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-800/50 rounded-xl border border-white/10">
            <p className="text-red-400">Failed to load analytics data.</p>
        </div>
      )}
    </div>
  );
};