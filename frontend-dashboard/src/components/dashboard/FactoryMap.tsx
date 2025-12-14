import { useEffect, useState } from 'react';
import { WorkerAvatar } from './WorkerAvatar';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, IdCard, MapPin } from 'lucide-react';

interface FactoryMapProps {
  initialWorkers: any[];
  isLoading: boolean;
}

export const FactoryMap = ({ initialWorkers, isLoading }: FactoryMapProps) => {
  const socket = useSocket();
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (initialWorkers && initialWorkers.length > 0) {
      setWorkers(initialWorkers);
    }
  }, [initialWorkers]);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      console.log("🟢 Map connected to WebSocket");
      setIsConnected(true);
    };
    const onDisconnect = () => {
      console.log("🔴 Map disconnected from WebSocket");
      setIsConnected(false);
    };

    if (socket.connected) setIsConnected(true);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    const handleWorkerUpdate = (updatedWorker: any) => {
      setWorkers((prevWorkers) => 
        prevWorkers.map((w) => {
          if (w.id === updatedWorker.id) {
            if (selectedWorker && selectedWorker.id === updatedWorker.id) {
               setSelectedWorker(updatedWorker);
            }
            return updatedWorker;
          }
          return w;
        })
      );
    };

    socket.on('worker:update', handleWorkerUpdate);

    return () => {
      socket.off('worker:update', handleWorkerUpdate);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket, selectedWorker]);

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center text-gray-500 animate-pulse">Initializing Digital Twin...</div>;
  }

  return (
    <div className="relative w-full h-full bg-gray-900/80 rounded-xl border border-white/10 shadow-inner font-sans min-h-[500px]">

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-[10px] font-bold tracking-wider text-gray-300">
          {isConnected ? 'LIVE FEED' : 'OFFLINE'}
        </span>
      </div>

      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      </div>
      <div className="absolute top-5 left-5 text-xs font-mono text-gray-600 border border-gray-700 px-2 py-1 rounded pointer-events-none">ASSEMBLY A</div>

      {workers.map((worker) => (
        <WorkerAvatar 
          key={worker.id} 
          worker={worker} 
          onClick={setSelectedWorker} 
        />
      ))}

      <AnimatePresence>
        {selectedWorker && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-4 right-4 bottom-4 w-72 bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-5 flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Worker Profile</h3>
              <button onClick={() => setSelectedWorker(null)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {selectedWorker.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">{selectedWorker.name}</h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                  <IdCard size={12} />
                  <span>ID: {selectedWorker.employeeId || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Current Status</p>
                <div className="flex items-center gap-2">
                  <Activity size={16} className={selectedWorker.status === 'AVAILABLE' ? 'text-green-400' : 'text-blue-400'} />
                  <span className="font-semibold text-white">{selectedWorker.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Real-time Location</p>
                <div className="flex items-center gap-2 text-sm font-mono text-teal-300">
                  <MapPin size={16} />
                  <span>X: {selectedWorker.location_x?.toFixed(1)}%</span>
                  <span className="text-gray-600">|</span>
                  <span>Y: {selectedWorker.location_y?.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-white/10">
                <button 
                  onClick={() => setSelectedWorker(null)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    Close Panel
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};