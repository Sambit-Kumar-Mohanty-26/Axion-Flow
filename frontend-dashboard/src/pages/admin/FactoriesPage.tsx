import { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient'; 
import { motion } from 'framer-motion';
import { Building, PlusCircle } from 'lucide-react';
import { AddFactoryModal } from '../../components/modals/AddFactoryModal';
interface Factory {
  id: string;
  name: string;
  status: string;
}

export const FactoriesPage = () => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchFactories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get('/factories');
        setFactories(response.data);
      } catch (err) {
        setError('Failed to fetch factories. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFactories();
  }, []); 

   const handleFactoryAdded = (newFactory: Factory) => {
    setFactories((prevFactories) => [...prevFactories, newFactory]);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Manage Factories</h1>
          <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <PlusCircle size={20} />
              Add New Factory
            </button>
          </div>

        <div className="bg-gray-800/50 border border-white/10 rounded-xl">
          {isLoading && <p className="p-4 text-gray-400">Loading factories...</p>}
          {error && <p className="p-4 text-red-400">{error}</p>}
          
          {!isLoading && !error && (
            <ul className="divide-y divide-white/10">
              {factories.length > 0 ? (
                factories.map((factory, index) => (
                  <motion.li
                    key={factory.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Building className="text-gray-500" />
                      <div>
                        <p className="font-semibold text-white">{factory.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          factory.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {factory.status}
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white">...</button>
                  </motion.li>
                ))
              ) : (
                <p className="p-4 text-gray-400">No factories found. Add your first one!</p>
              )}
            </ul>
          )}
        </div>
      </motion.div>
      
      <AddFactoryModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onFactoryAdded={handleFactoryAdded}
        />
    </>
  );
};