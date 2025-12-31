import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import apiClient from '../../api/apiClient';
import { Bell, Check, AlertTriangle, Info, ShieldAlert, ChevronDown } from 'lucide-react';
import { Popover, Transition } from '@headlessui/react';

interface Alert {
  id: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const TopNav = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  const unreadCount = alerts.filter(a => !a.isRead).length;

  const fetchAlerts = async () => {
    try {
      const res = await apiClient.get('/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed to load alerts");
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.put('/alerts/read-all');
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewAlert = (newAlert: Alert) => {
        setAlerts(prev => [newAlert, ...prev]);
    };

    socket.on('alert:new', handleNewAlert);
    return () => { socket.off('alert:new', handleNewAlert); };
  }, [socket]);


  const formatRole = (role: string) => {
    switch (role) {
      case 'ORG_ADMIN': return 'Organization Admin';
      case 'FACTORY_MANAGER': return 'Factory Manager';
      case 'WORKER': return 'Operator';
      default: return 'User';
    }
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'CRITICAL': return <ShieldAlert size={16} className="text-red-500" />;
          case 'WARNING': return <AlertTriangle size={16} className="text-orange-500" />;
          default: return <Info size={16} className="text-blue-500" />;
      }
  };

  return (
    <header className="h-16 bg-gray-800/50 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-6 z-40 relative">

      <div />

      <div className="flex items-center gap-6">

        <Popover className="relative">
          {({ open }) => (
            <>
              <Popover.Button className={`relative p-2 rounded-full hover:bg-gray-700 transition-colors ${open ? 'bg-gray-700' : ''} outline-none`}>
                <Bell size={20} className="text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-800 animate-pulse" />
                )}
              </Popover.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute right-0 mt-3 w-80 sm:w-96 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gray-800/50">
                        <h3 className="font-bold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <Check size={12} /> Mark all read
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No notifications</div>
                        ) : (
                            alerts.map(alert => (
                                <div key={alert.id} className={`p-4 border-b border-white/5 flex gap-3 hover:bg-white/5 transition-colors ${!alert.isRead ? 'bg-blue-500/5' : ''}`}>
                                    <div className={`mt-1 p-1.5 rounded-full ${!alert.isRead ? 'bg-gray-800' : 'bg-transparent'}`}>
                                        {getIcon(alert.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm ${!alert.isRead ? 'text-white font-semibold' : 'text-gray-400'}`}>
                                            {alert.message}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {new Date(alert.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    {!alert.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                                </div>
                            ))
                        )}
                    </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>

        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-white">{user?.email || 'Loading...'}</p>
            <p className="text-xs text-teal-400">{user?.role ? formatRole(user.role) : ''}</p>
          </div>
          <button onClick={logout} className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-red-400" title="Logout">
             <ChevronDown size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};