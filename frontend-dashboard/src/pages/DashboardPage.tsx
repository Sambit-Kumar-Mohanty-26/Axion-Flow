import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from './admin/AdminDashboard';
import { ManagerDashboard } from './manager/ManagerDashboard';

const WorkerDashboard = () => <div>This is the WORKER Dashboard. You can see your tasks and clock in.</div>;

export const DashboardPage = () => {
  const { user } = useAuth();
  if (!user) return <div>Loading user data...</div>;

  switch (user.role) {
    case 'ORG_ADMIN':
      return <AdminDashboard />;
    case 'FACTORY_MANAGER':
      return <ManagerDashboard />;
    case 'WORKER':
      return <WorkerDashboard />;
    default:
      return <div>Unknown role. Please contact support.</div>;
  }
};