import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { UserPlus, ChevronDown, Check } from 'lucide-react';
import apiClient from '../../api/apiClient';

interface Factory {
  id: string;
  name: string;
}

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserInvited: () => void; 
}

export const InviteUserModal = ({ isOpen, onClose, onUserInvited }: InviteUserModalProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'FACTORY_MANAGER' | 'ORG_ADMIN'>('FACTORY_MANAGER');
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchFactories = async () => {
        setIsLoading(true);
        try {
          const response = await apiClient.get('/factories');
          setFactories(response.data);
          
          if (response.data.length > 0) {
            setSelectedFactory(response.data[0]);
          }
        } catch (err) {
          console.error("Failed to fetch factories for modal", err);
          setError("Could not load factories. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchFactories();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFactory) {
      setError("Please select a factory for the user.");
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await apiClient.post('/invites', {
        email,
        role,
        factoryId: selectedFactory.id,
      });
      onUserInvited();
      handleClose(); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('FACTORY_MANAGER');
    setSelectedFactory(factories.length > 0 ? factories[0] : null);
    setError('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-white/10">
                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-white flex items-center gap-2">
                  <UserPlus /> Invite New User
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full p-2 bg-gray-700 rounded-md text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label htmlFor="role" className="text-sm font-medium text-gray-300">Assign Role</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="mt-1 w-full p-2 bg-gray-700 rounded-md text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="FACTORY_MANAGER">Factory Manager</option>
                      <option value="ORG_ADMIN">Organization Admin</option>
                    </select>
                  </div>

                  <div>
                    <Listbox value={selectedFactory} onChange={setSelectedFactory}>
                      <Listbox.Label className="text-sm font-medium text-gray-300">Assign to Factory</Listbox.Label>
                      <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-gray-700 py-2 pl-3 pr-10 text-left border border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                          <span className="block truncate text-white">{selectedFactory?.name || "Select a factory"}</span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><ChevronDown className="h-5 w-5 text-gray-400" /></span>
                        </Listbox.Button>
                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {factories.map((factory) => (
                              <Listbox.Option key={factory.id} value={factory} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>
                                {({ selected }) => (<>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{factory.name}</span>
                                  {selected && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white"><Check className="h-5 w-5" /></span>}
                                </>)}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>

                  {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

                  <div className="mt-6 flex justify-end gap-4 pt-4">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                      {isLoading ? 'Sending Invite...' : 'Send Invite'}
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