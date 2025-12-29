import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axionLogo from '../../assets/logo.png';
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  LogOut, 
  HardHat,
  BrainCircuit
} from 'lucide-react';

const navLinks = [
  { to: "/dashboard", icon: <LayoutDashboard size={20} />, text: "Overview" },
  { to: "/dashboard/workers", icon: <HardHat size={20} />, text: "Workers", managerOnly: true },
  { to: "/dashboard/simulation", icon: <BrainCircuit size={20} />, text: "Simulation", managerOnly: true },
  { to: "/dashboard/factories", icon: <Building size={20} />, text: "Factories", adminOnly: true },
  { to: "/dashboard/users", icon: <Users size={20} />, text: "Users", adminOnly: true },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 h-screen bg-gray-800 text-gray-300 flex flex-col flex-shrink-0 border-r border-white/10">
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <Link to="/dashboard">
          <img src={axionLogo} alt="Axion Flow Logo" className="h-8 w-8" />
        </Link>
        <span className="text-xl font-bold text-white">Axion Flow</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => {
          if (link.adminOnly && user?.role !== 'ORG_ADMIN') {
            return null;
          }

          if (link.managerOnly && user?.role === 'WORKER') {
            return null;
          }
          
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard"} 
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'hover:bg-gray-700'}`
              }
            >
              {link.icon}
              {link.text}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-900/50 hover:text-red-400 transition-colors text-sm font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};