import { useEffect, useState } from 'react';
import { WorkerAvatar } from './WorkerAvatar';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, IdCard, MapPin, Plus, Star } from 'lucide-react';
import apiClient from '../../api/apiClient';

interface FactoryMapProps {
  initialWorkers: any[];
  isLoading: boolean;
}

export const FactoryMap = ({ initialWorkers, isLoading }: FactoryMapProps) => {
  const socket = useSocket();
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [skillForm, setSkillForm] = useState({ skillId: '', proficiency: 1 });

  useEffect(() => {
    if (initialWorkers && initialWorkers.length > 0) setWorkers(initialWorkers);
  }, [initialWorkers]);

  useEffect(() => {
    if (isAddingSkill) {
      apiClient.get('/skills')
        .then(res => setAvailableSkills(res.data))
        .catch(console.error);
    }
  }, [isAddingSkill]);

  useEffect(() => {
    if (!socket) return;
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    if (socket.connected) setIsConnected(true);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    const handleWorkerUpdate = (updatedWorker: any) => {
      setWorkers((prevWorkers) => 
        prevWorkers.map((w) => {
          if (w.id === updatedWorker.id) {
            if (selectedWorker && selectedWorker.id === updatedWorker.id) {
               setSelectedWorker((_curr: any) => ({ ...updatedWorker })); 
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

  const handleAddSkillSubmit = async () => {
    if (!selectedWorker || !skillForm.skillId) return;
    try {
        await apiClient.post(`/workers/${selectedWorker.id}/skills`, skillForm);
        setIsAddingSkill(false);
    } catch (error) {
        console.error("Failed to add skill", error);
        alert("Failed to add skill.");
    }
  };

  if (isLoading) return <div className="w-full h-full flex items-center justify-center text-gray-500 animate-pulse">Initializing Digital Twin...</div>;

  return (
    <div className="relative w-full h-full bg-gray-900/80 rounded-xl border border-white/10 shadow-inner font-sans min-h-[500px]">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-[10px] font-bold tracking-wider text-gray-300">{isConnected ? 'LIVE FEED' : 'OFFLINE'}</span>
      </div>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      <div className="absolute top-5 left-5 text-xs font-mono text-gray-600 border border-gray-700 px-2 py-1 rounded pointer-events-none">ASSEMBLY A</div>
      
      {workers.map((worker) => (
        <WorkerAvatar key={worker.id} worker={worker} onClick={setSelectedWorker} />
      ))}

      <AnimatePresence>
        {selectedWorker && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-4 right-4 bottom-4 w-80 bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-5 flex flex-col overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Worker Profile</h3>
              <button onClick={() => { setSelectedWorker(null); setIsAddingSkill(false); }} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {selectedWorker.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">{selectedWorker.name}</h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                  <IdCard size={12} />
                  <span>ID: {selectedWorker.employeeId || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-500 mb-1">STATUS</p>
                    <div className="flex items-center gap-1.5">
                        <Activity size={14} className={selectedWorker.status === 'AVAILABLE' ? 'text-green-400' : 'text-blue-400'} />
                        <span className="text-xs font-semibold text-white">{selectedWorker.status.replace('_', ' ')}</span>
                    </div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-500 mb-1">LOCATION</p>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-teal-300">
                        <MapPin size={14} />
                        <span>{selectedWorker.location_x?.toFixed(0)}, {selectedWorker.location_y?.toFixed(0)}</span>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-white">Skills</h4>
                    <button 
                        onClick={() => setIsAddingSkill(!isAddingSkill)}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                        <Plus size={12} /> Add
                    </button>
                </div>

                <AnimatePresence>
                {isAddingSkill && (
                    <motion.div 
                        initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} exit={{height: 0, opacity: 0}}
                        className="mb-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30 overflow-hidden"
                    >
                        <select 
                            className="w-full mb-2 bg-gray-900 text-xs text-white p-2 rounded border border-white/10"
                            value={skillForm.skillId}
                            onChange={(e) => setSkillForm({...skillForm, skillId: e.target.value})}
                        >
                            <option value="">Select Skill...</option>
                            {availableSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select 
                            className="w-full mb-2 bg-gray-900 text-xs text-white p-2 rounded border border-white/10"
                            value={skillForm.proficiency}
                            onChange={(e) => setSkillForm({...skillForm, proficiency: Number(e.target.value)})}
                        >
                            <option value={1}>Level 1 (Beginner)</option>
                            <option value={2}>Level 2 (Intermediate)</option>
                            <option value={3}>Level 3 (Expert)</option>
                            <option value={4}>Level 4 (Master)</option>
                            <option value={5}>Level 5 (Legend)</option>
                        </select>
                        <button 
                            onClick={handleAddSkillSubmit}
                            className="w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500"
                        >
                            Save Skill
                        </button>
                    </motion.div>
                )}
                </AnimatePresence>

                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {selectedWorker.skills && selectedWorker.skills.length > 0 ? (
                        selectedWorker.skills.map((ws: any) => (
                            <div key={ws.skillId} className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/5">
                                <span className="text-xs text-gray-300">{ws.skill.name}</span>
                                <div className="flex gap-0.5">
                                    {[...Array(ws.proficiency)].map((_, i) => (
                                        <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-500 italic">No skills assigned.</p>
                    )}
                </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-white/10">
                <button 
                  onClick={() => setSelectedWorker(null)}
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    Close
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
