import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Outlet } from 'react-router-dom';

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};