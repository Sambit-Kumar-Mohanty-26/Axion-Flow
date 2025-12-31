import { useEffect, useState, useRef } from 'react';
import { WorkerAvatar } from './WorkerAvatar';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, IdCard, MapPin, Plus, Star, Box, Edit3, Save, RotateCcw, Layers, History, AlertTriangle } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { Rnd } from 'react-rnd'; 
import { useToast } from '../ui/Toast';

interface FactoryMapProps {
  initialWorkers: any[];
  isLoading: boolean;
  heatmapData?: number[][] | null;
  isReplay?: boolean;
}

interface SOSPayload {
  workerId: string;
  name: string;
  location: { x: number; y: number };
  factoryId: string;
}

interface SOSResolvePayload {
  workerId: string;
}

export const FactoryMap = ({ initialWorkers, isLoading, heatmapData, isReplay }: FactoryMapProps) => {
  const socket = useSocket();
  const { showToast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [skillForm, setSkillForm] = useState({ skillId: '', proficiency: 1 });

  const [obstacles, setObstacles] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [originalObstacles, setOriginalObstacles] = useState<any[]>([]);

  useEffect(() => {
    if (initialWorkers && initialWorkers.length > 0) {
      setWorkers(initialWorkers);
    } else if (!isLoading && !isReplay && !heatmapData) {
      setWorkers([]);
    }
  }, [initialWorkers, isLoading, isReplay, heatmapData]);

  const fetchLayout = () => {
    apiClient.get('/factories/layout')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setObstacles(data);
        setOriginalObstacles(data);
      })
      .catch(console.error);
  };

  useEffect(() => { fetchLayout(); }, []);

  useEffect(() => {
    if (isAddingSkill) {
      apiClient.get('/skills').then(res => setAvailableSkills(res.data)).catch(console.error);
    }
  }, [isAddingSkill]);

  useEffect(() => {
    if (!socket || isReplay || heatmapData) {
        setIsConnected(false);
        return;
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    if (socket.connected) setIsConnected(true);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    const handleWorkerUpdate = (updatedWorker: any) => {
      setWorkers((prevWorkers) => 
        prevWorkers.map((w) => {
          if (w.id === updatedWorker.id) {
            const newWorker = { ...w, ...updatedWorker };
            if (selectedWorker && selectedWorker.id === updatedWorker.id) {
               setSelectedWorker(newWorker); 
            }
            return newWorker;
          }
          return w;
        })
      );
    };

    const handleSOS = (data: SOSPayload) => {
        setWorkers(prev => prev.map(w => {
            if (w.id === data.workerId) {
                const newWorker = { ...w, isSOS: true };
                if (selectedWorker && selectedWorker.id === data.workerId) {
                     setSelectedWorker(newWorker);
                }
                return newWorker;
            }
            return w;
        }));
    };

    const handleSOSResolve = (data: SOSResolvePayload) => {
        setWorkers(prev => prev.map(w => {
            if (w.id === data.workerId) {
                const newWorker = { ...w, isSOS: false };
                if (selectedWorker && selectedWorker.id === data.workerId) {
                     setSelectedWorker(newWorker);
                }
                return newWorker;
            }
            return w;
        }));
    };

    socket.on('worker:update', handleWorkerUpdate);
    socket.on('manager:sos-alert', handleSOS);
    socket.on('worker:sos-resolve', handleSOSResolve);

    return () => {
      socket.off('worker:update', handleWorkerUpdate);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('manager:sos-alert', handleSOS);
      socket.off('worker:sos-resolve', handleSOSResolve);
    };
  }, [socket, selectedWorker, isReplay, heatmapData]);

  const handleAddSkillSubmit = async () => {
    if (!selectedWorker || !skillForm.skillId) return;
    try {
        await apiClient.post(`/workers/${selectedWorker.id}/skills`, skillForm);
        setIsAddingSkill(false);
        showToast('Skill assigned successfully', 'success');
    } catch (error) {
        showToast('Failed to add skill', 'error');
    }
  };
  const saveLayout = async () => {
    try {
      await apiClient.put('/factories/layout', { layout: obstacles });
      setIsEditing(false);
      setOriginalObstacles(obstacles);
      showToast('Floor plan saved!', 'success');
    } catch (error) {
      showToast('Failed to save layout', 'error');
    }
  };

  const cancelEdit = () => {
    setObstacles(originalObstacles);
    setIsEditing(false);
  };

  const addObstacle = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setObstacles([...obstacles, { id: newId, x: 40, y: 40, w: 15, h: 15, label: 'New Machine' }]);
  };

  const removeObstacle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault(); 
    setObstacles(prev => prev.filter(o => o.id !== id));
  };

  const updateObstacleLabel = (id: string, newLabel: string) => {
    setObstacles(prev => prev.map(o => o.id === id ? { ...o, label: newLabel } : o));
  };

  if (isLoading) return <div className="w-full h-full flex items-center justify-center text-gray-500 animate-pulse">Initializing Digital Twin...</div>;

  return (
    <div className="relative w-full h-full bg-gray-900/80 rounded-xl border border-white/10 shadow-inner font-sans min-h-[500px] overflow-hidden" ref={mapRef}>
      <div className="absolute top-4 left-4 z-30 flex gap-2">
        {!isEditing ? (
            <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-lg border border-white/10 hover:bg-gray-700 transition-colors shadow-lg"
            >
                <Edit3 size={14} /> Edit Floor Plan
            </button>
        ) : (
            <div className="flex items-center gap-2 bg-black/50 p-1 rounded-lg backdrop-blur-sm border border-white/10">
                <button 
                    onClick={addObstacle}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-500 transition-colors"
                >
                    <Plus size={14} /> Add Object
                </button>
                <button 
                    onClick={saveLayout}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-md hover:bg-green-500 transition-colors"
                >
                    <Save size={14} /> Save
                </button>
                <button 
                    onClick={cancelEdit}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-gray-300 text-xs font-bold rounded-md hover:bg-gray-600 transition-colors"
                >
                    <RotateCcw size={14} /> Cancel
                </button>
            </div>
        )}
      </div>

      <div className="absolute top-4 right-4 z-20">
        {isReplay ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/80 backdrop-blur-md rounded-full border border-blue-500/30 shadow-xl">
                <History size={12} className="text-blue-400" />
                <span className="text-[10px] font-bold tracking-wider text-blue-100">REPLAY MODE</span>
            </div>
        ) : heatmapData ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-900/80 backdrop-blur-md rounded-full border border-orange-500/30 shadow-xl">
                <Layers size={12} className="text-orange-400" />
                <span className="text-[10px] font-bold tracking-wider text-orange-100">HEATMAP VIEW</span>
            </div>
        ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-bold tracking-wider text-gray-300">{isConnected ? 'LIVE FEED' : 'OFFLINE'}</span>
            </div>
        )}
      </div>

      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '5% 5%' }}></div>
      
      {heatmapData && (
        <>
            <div className="absolute inset-0 grid grid-rows-10 grid-cols-10 pointer-events-none z-10 m-1 rounded-lg overflow-hidden">
            {heatmapData.map((row, rIndex) => 
                row.map((intensity, cIndex) => (
                    <div 
                        key={`${rIndex}-${cIndex}`}
                        style={{ 
                            backgroundColor: intensity > 0.6 ? 'rgba(239, 68, 68, 1)' : intensity > 0.3 ? 'rgba(234, 179, 8, 1)' : 'rgba(34, 197, 94, 1)', 
                            opacity: Math.min(intensity * 0.7, 0.8) 
                        }}
                        className="w-full h-full blur-2xl transition-opacity duration-500"
                    />
                ))
            )}
            </div>

            <div className="absolute bottom-4 left-4 z-40 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/10 shadow-xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Traffic Density</p>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white">Low</span>
                    <div className="w-24 h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
                    <span className="text-[10px] text-white">High</span>
                </div>
            </div>
        </>
      )}

      {obstacles.map((obs, index) => {
        const mapW = mapRef.current?.offsetWidth || 1;
        const mapH = mapRef.current?.offsetHeight || 1;
        const xPos = (obs.x / 100) * mapW;
        const yPos = (obs.y / 100) * mapH;
        const widthPx = (obs.w / 100) * mapW;
        const heightPx = (obs.h / 100) * mapH;

        if (isEditing) {
            return (
                <Rnd
                    key={obs.id}
                    bounds="parent"
                    size={{ width: widthPx, height: heightPx }}
                    position={{ x: xPos, y: yPos }}
                    onDragStop={(_e, d) => {
                        const newX = (d.x / mapW) * 100;
                        const newY = (d.y / mapH) * 100;
                        const newObstacles = [...obstacles];
                        newObstacles[index] = { ...obs, x: newX, y: newY };
                        setObstacles(newObstacles);
                    }}
                    onResizeStop={(_e, _direction, ref, _delta, position) => {
                        const wPercent = (parseFloat(ref.style.width) / mapW) * 100;
                        const hPercent = (parseFloat(ref.style.height) / mapH) * 100;
                        const xPercent = (position.x / mapW) * 100;
                        const yPercent = (position.y / mapH) * 100;
                        
                        const newObstacles = [...obstacles];
                        newObstacles[index] = { ...obs, w: wPercent, h: hPercent, x: xPercent, y: yPercent };
                        setObstacles(newObstacles);
                    }}
                    className="bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center group z-50"
                    dragHandleClassName="drag-handle"
                >
                    <div 
                        onClick={(e) => removeObstacle(obs.id, e)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 cursor-pointer shadow-md hover:scale-110 transition-transform z-50"
                    >
                        <X size={10} />
                    </div>

                    <div className="w-full px-2 text-center drag-handle cursor-move h-full flex flex-col justify-center">
                        <Box className="mx-auto text-blue-300 mb-1 pointer-events-none" size={16} />
                        <input 
                            type="text" 
                            value={obs.label} 
                            onChange={(e) => updateObstacleLabel(obs.id, e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="w-full bg-transparent text-center text-[10px] font-mono text-white font-bold uppercase tracking-wider focus:outline-none focus:border-b border-blue-400"
                        />
                    </div>
                </Rnd>
            );
        } else {
            return (
                <div
                    key={obs.id}
                    className="absolute bg-gray-800/90 border border-teal-500/30 flex items-center justify-center shadow-lg rounded-sm"
                    style={{ left: `${obs.x}%`, top: `${obs.y}%`, width: `${obs.w}%`, height: `${obs.h}%`, zIndex: heatmapData ? 15 : 5 }}
                >
                    <div className="text-center opacity-70 w-full overflow-hidden px-1">
                        <Box className="mx-auto text-teal-500/50 mb-1" size={20} />
                        <span className="text-[9px] font-mono text-teal-400 font-bold uppercase tracking-wider block truncate">{obs.label}</span>
                    </div>
                     <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #00b8a9 5px, #00b8a9 6px)' }}></div>
                </div>
            );
        }
      })}

      {!heatmapData && workers.map((worker) => (
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
            
            {selectedWorker.isSOS && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg animate-pulse">
                    <p className="text-red-400 font-bold text-xs uppercase mb-2 flex items-center gap-2">
                        <AlertTriangle size={14}/> Emergency Active
                    </p>
                    <button 
                        onClick={async () => {
                            await apiClient.put(`/workers/${selectedWorker.id}/sos`, { active: false });
                            setSelectedWorker((prev: any) => ({...prev, isSOS: false}));
                        }}
                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-xs transition-colors"
                    >
                        MARK RESOLVED
                    </button>
                </div>
            )}

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