import { useState } from 'react';
import apiClient from '../../api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BrainCircuit, Zap, AlertTriangle, CheckCircle, RotateCcw, Lightbulb } from 'lucide-react';

export const SimulationPage = () => {
  const [taskCount, setTaskCount] = useState(100);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [shiftHours, setShiftHours] = useState(8);
  const [deadlineDays, setDeadlineDays] = useState(3);

  const [isLoading, setIsLoading] = useState(false);
  const [fullResults, setFullResults] = useState<any>(null);
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  const [currentLabel, setCurrentLabel] = useState("Start");
  const [isReplaying, setIsReplaying] = useState(false);

  const runSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFullResults(null);
    setDisplayedData([]);
    setCurrentLabel("Start");

    try {
      const response = await apiClient.post('/dashboard/simulate', {
        taskCount,
        taskDifficulty: difficulty,
        shiftHours,
        deadlineHours: deadlineDays * 24
      });

      setFullResults(response.data);
      setIsLoading(false);
      playSimulation(response.data.timeSeries);

    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const playSimulation = (data: any[]) => {
    setIsReplaying(true);
    setDisplayedData([]);
    
    let index = 0;
    const intervalTime = data.length > 100 ? 20 : 50;

    const interval = setInterval(() => {
      if (index >= data.length) {
        clearInterval(interval);
        setIsReplaying(false);
        return;
      }

      const nextPoint = data[index];
      setDisplayedData(prev => [...prev, nextPoint]);
      setCurrentLabel(nextPoint.timeLabel);
      index++;
    }, intervalTime);
  };

  const formatTotalTime = (minutes: number) => {
    const days = Math.floor(minutes / (24 * 60));
    const remainingMins = minutes % (24 * 60);
    const hours = Math.floor(remainingMins / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-green-500/20 text-green-400 border-green-500/50';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BrainCircuit className="text-purple-400" size={32} />
            "What-If" Simulation Engine
          </h1>
          <p className="text-gray-400">Predict bottlenecks and validate production schedules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="bg-gray-800/50 p-6 rounded-xl border border-white/10 h-fit backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-6">Scenario Constraints</h2>
          <form onSubmit={runSimulation} className="space-y-6">
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-400">Tasks to Inject</label>
                <span className="text-xl font-mono text-teal-400 font-bold">{taskCount}</span>
              </div>
              <input type="range" min="20" max="500" step="10" value={taskCount} onChange={(e) => setTaskCount(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-400">Deadline Target</label>
                <span className="text-xl font-mono text-red-400 font-bold">{deadlineDays} Days</span>
              </div>
              <input type="range" min="1" max="14" step="1" value={deadlineDays} onChange={(e) => setDeadlineDays(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Shift Length: <span className="text-blue-400 font-bold">{shiftHours}h</span></label>
              <input type="range" min="4" max="12" step="1" value={shiftHours} onChange={(e) => setShiftHours(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>

             <div className="grid grid-cols-3 gap-2">
                {['LOW', 'MEDIUM', 'HIGH'].map(level => (
                  <button type="button" key={level} onClick={() => setDifficulty(level)} className={`py-2 rounded-lg text-xs font-bold transition-all border ${difficulty === level ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>{level}</button>
                ))}
              </div>

            <button type="submit" disabled={isLoading || isReplaying} className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {isLoading ? <span className="animate-pulse">Processing...</span> : <><Zap size={18} /> Run Prediction Model</>}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {!fullResults && !isLoading && (
            <div className="h-[400px] flex flex-col items-center justify-center bg-gray-800/20 rounded-xl border-2 border-dashed border-gray-700 text-gray-500">
              <BrainCircuit size={64} className="mb-4 opacity-20" />
              <p>Configure parameters to run the AI simulation.</p>
            </div>
          )}

          {fullResults && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="flex justify-between items-end">
                <div>
                   <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Projected Timeline</p>
                   <div className="flex items-center gap-3">
                       <p className="text-4xl font-mono font-bold text-white">{currentLabel}</p>
                       {!isReplaying && (
                           <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-2 ${getRiskColor(fullResults.riskLevel)}`}>
                               {fullResults.riskLevel === 'CRITICAL' ? <AlertTriangle size={14}/> : <CheckCircle size={14}/>}
                               {fullResults.riskReason}
                           </div>
                       )}
                   </div>
                </div>
                {!isReplaying && <button onClick={() => playSimulation(fullResults.timeSeries)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1"><RotateCcw size={12} /> Replay</button>}
              </div>

              <div className="bg-gray-900/80 p-6 rounded-xl border border-white/10 h-80 shadow-inner relative overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayedData}>
                    <defs>
                      <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                    
                    <XAxis dataKey="timeLabel" stroke="#6b7280" fontSize={10} tickMargin={10} interval="preserveStartEnd" minTickGap={30} />

                    <YAxis yAxisId="left" stroke="#8b5cf6" fontSize={10} label={{ value: 'Pending Tasks', angle: -90, position: 'insideLeft', fill: '#8b5cf6' }} />

                    <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={10} unit="%" label={{ value: 'Fatigue', angle: 90, position: 'insideRight', fill: '#ef4444' }} />
                    
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                    <Legend />
                    
                    <Area yAxisId="left" type="monotone" dataKey="tasksRemaining" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" name="Queue Size" isAnimationActive={false} />
                    <Area yAxisId="right" type="monotone" dataKey="avgFatigue" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorFatigue)" name="Avg Fatigue %" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <AnimatePresence>
              {!isReplaying && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Est. Completion</p>
                            <p className="text-2xl font-bold text-white">{formatTotalTime(fullResults.estimatedCompletionTime)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase">Shifts</p>
                            <p className="text-xl font-bold text-blue-400">{fullResults.workDays}</p>
                        </div>
                    </div>

                    <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/20">
                        <p className="text-xs text-blue-400 uppercase font-bold mb-2 flex items-center gap-2">
                            <Lightbulb size={14} /> AI Suggestions
                        </p>
                        <ul className="space-y-1">
                            {fullResults.recommendations.map((rec: string, i: number) => (
                                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">➤</span> {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                  </motion.div>
              )}
              </AnimatePresence>

            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};