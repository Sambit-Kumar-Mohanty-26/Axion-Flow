import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Wrench, Plus } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useToast } from '../ui/Toast';

interface Skill {
  id: string;
  name: string;
}

interface ManageSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageSkillsModal = ({ isOpen, onClose }: ManageSkillsModalProps) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) fetchSkills();
  }, [isOpen]);

  const fetchSkills = async () => {
    try {
      const res = await apiClient.get('/skills');
      setSkills(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setIsLoading(true);

    try {
      const res = await apiClient.post('/skills', { name: newSkillName });
      setSkills([...skills, res.data]);
      setNewSkillName('');
      showToast('Skill added successfully', 'success');
    } catch (error) {
      showToast('Failed to add skill', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 shadow-xl border border-white/10">
              <Dialog.Title as="h3" className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="text-blue-400" /> Manage Skills
              </Dialog.Title>

              <form onSubmit={handleAddSkill} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Forklift Driving"
                  className="flex-1 px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
                >
                  <Plus size={20} />
                </button>
              </form>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Existing Skills</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {skills.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No skills added yet.</p>
                  ) : (
                    skills.map((skill) => (
                      <div key={skill.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg border border-white/5">
                        <span className="text-white">{skill.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Close</button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};