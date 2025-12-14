import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Outlet } from 'react-router-dom';

export const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};