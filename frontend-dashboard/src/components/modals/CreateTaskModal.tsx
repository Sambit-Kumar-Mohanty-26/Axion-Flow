import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { PlusCircle, Check, ChevronDown, AlertCircle, MapPin } from 'lucide-react';
import apiClient from '../../api/apiClient';

interface Skill {
  id: string;
  name: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const CreateTaskModal = ({ isOpen, onClose }: CreateTaskModalProps) => {
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const [locX, setLocX] = useState(50);
  const [locY, setLocY] = useState(50);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchSkills = async () => {
        try {
          const response = await apiClient.get('/skills');
          setSkills(response.data);
        } catch (err) {
          console.error("Failed to load skills", err);
        }
      };
      fetchSkills();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      await apiClient.post('/tasks', {
        description,
        priority,
        requiredSkillId: selectedSkill?.id,
        location_x: locX,
        location_y: locY
      });
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setPriority('MEDIUM');
    setSelectedSkill(null);
    setLocX(50);
    setLocY(50);
    setError('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-visible rounded-2xl bg-gray-800 p-6 text-left shadow-xl transition-all border border-white/10">
                <Dialog.Title as="h3" className="text-lg font-bold text-white flex items-center gap-2">
                  <PlusCircle className="text-blue-400" /> Create New Task
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Task Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Inspect hydraulic pump #4"
                      className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Priority Level</label>
                    <div className="grid grid-cols-4 gap-2">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${
                            priority === p 
                              ? p === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Required Skill (Optional)</label>
                    <Listbox value={selectedSkill} onChange={setSelectedSkill}>
                      <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-900 py-2.5 pl-3 pr-10 text-left border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
                        <span className={`block truncate ${selectedSkill ? 'text-white' : 'text-gray-500'}`}>
                          {selectedSkill ? selectedSkill.name : 'Select a skill...'}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </span>
                      </Listbox.Button>
                      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50 border border-white/10">
                          {skills.map((skill) => (
                            <Listbox.Option
                              key={skill.id}
                              value={skill}
                              className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                            >
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{skill.name}</span>
                                  {selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white"><Check className="h-3 w-3" /></span>}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </Listbox>
                  </div>

                  <div className="bg-gray-900/50 p-3 rounded-lg border border-white/5">
                    <label className="block text-sm font-medium text-gray-400 mb-2 items-center gap-2">
                        <MapPin size={14} /> Task Location
                    </label>
                    
                    <div className="flex gap-4 items-center mb-2">
                        <span className="text-xs text-teal-400 w-4 font-mono">X</span>
                        <input 
                        type="range" min="0" max="100" value={locX} 
                        onChange={(e) => setLocX(Number(e.target.value))}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-white w-8 font-mono">{locX}%</span>
                    </div>

                    <div className="flex gap-4 items-center">
                        <span className="text-xs text-teal-400 w-4 font-mono">Y</span>
                        <input 
                        type="range" min="0" max="100" value={locY} 
                        onChange={(e) => setLocY(Number(e.target.value))}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-white w-8 font-mono">{locY}%</span>
                    </div>
                    
                    <div className="mt-3 w-full h-24 bg-black/40 border border-white/10 relative rounded overflow-hidden">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        
                        <div 
                        className="absolute w-3 h-3 bg-red-500 rounded-full -ml-1.5 -mt-1.5 border border-white shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                        style={{ left: `${locX}%`, top: `${locY}%` }}
                        />
                        <p className="absolute bottom-1 right-2 text-[10px] text-gray-600">Map Preview</p>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 transition-all">
                      {isLoading ? 'Creating...' : 'Create Task'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};