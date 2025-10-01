import { useAuth } from '../../context/AuthContext';
import { ChevronDown } from 'lucide-react';

export const TopNav = () => {
  const { user } = useAuth();

  const formatRole = (role: string) => {
    switch (role) {
      case 'ORG_ADMIN': return 'Organization Admin';
      case 'FACTORY_MANAGER': return 'Factory Manager';
      case 'WORKER': return 'Operator';
      default: return 'User';
    }
  };

  return (
    <header className="h-16 bg-gray-800/50 backdrop-blur-sm border-b border-white/10 flex items-center justify-end px-6">
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-white">{user?.email || 'Loading...'}</p>
          <p className="text-xs text-teal-400">{user?.role ? formatRole(user.role) : ''}</p>
        </div>
        <button className="flex items-center p-2 rounded-full hover:bg-gray-700 transition-colors">
          <ChevronDown size={20} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
};