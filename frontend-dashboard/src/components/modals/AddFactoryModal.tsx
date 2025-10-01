import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Building } from 'lucide-react';
import apiClient from '../../api/apiClient';

interface AddFactoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFactoryAdded: (newFactory: any) => void; 
}

export const AddFactoryModal = ({ isOpen, onClose, onFactoryAdded }: AddFactoryModalProps) => {
  const [factoryName, setFactoryName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!factoryName.trim()) {
      setError('Factory name cannot be empty.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/factories', { name: factoryName });
      onFactoryAdded(response.data); 
      onClose(); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create factory.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFactoryName('');
    setError('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* The backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-white/10">
                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-white flex items-center gap-2">
                  <Building size={20} />
                  Add a New Factory
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="mt-2">
                    <label htmlFor="factoryName" className="text-sm text-gray-400">Factory Name</label>
                    <input
                      id="factoryName"
                      type="text"
                      value={factoryName}
                      onChange={(e) => setFactoryName(e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Renukoot Production Plant"
                    />
                  </div>
                  
                  {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Create Factory'}
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