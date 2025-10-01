import { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Link as LinkIcon, Copy } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

export const WorkersPage = () => {
  const { user } = useAuth(); 
  const [pastedData, setPastedData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState('');

  const activationLink = `${window.location.origin}/join/${user?.factoryId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activationLink).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2500); 
    }, (err) => {
      setCopySuccess('Failed to copy');
      console.error('Could not copy text: ', err);
    });
  };

  const handleImport = async () => {

    const workersToImport = pastedData
      .split('\n')
      .map(line => {
        const [name, employeeId] = line.split(',').map(item => item.trim());
        if (name && employeeId) {
          return { name, employeeId };
        }
        return null;
      })
      .filter((worker): worker is { name: string; employeeId: string } => worker !== null);

    if (workersToImport.length === 0) {
      setFeedback({ type: 'error', message: 'No valid worker data found. Please use the format: Name, EmployeeID' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await apiClient.post('/workers/bulk-import', { workers: workersToImport });
      setFeedback({ type: 'success', message: response.data.message });
      setPastedData('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'An unknown error occurred during import.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Workers</h1>
      </div>
      
      <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <LinkIcon /> Worker Activation Link
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Share this single link with all pre-registered workers. They will use their Employee ID to activate their accounts.
        </p>
        <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-md">
          <input 
            type="text" 
            readOnly 
            value={activationLink}
            className="flex-1 bg-transparent text-teal-400 font-mono focus:outline-none"
          />
          <button 
            onClick={handleCopyLink} 
            className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded-md text-sm hover:bg-gray-600 transition-colors"
          >
            <Copy size={16} />
            {copySuccess || 'Copy'}
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <UploadCloud /> Bulk Import Workers
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Paste your list of workers below. Each worker should be on a new line in the format: <code className="bg-gray-700 p-1 rounded-md text-xs font-mono">Full Name, EmployeeID</code>
        </p>

        <textarea
          value={pastedData}
          onChange={(e) => setPastedData(e.target.value)}
          placeholder={
`Maria Garcia, 789-01
John Smith, 789-02
Li Wei, 789-03`
          }
          className="w-full h-48 p-3 bg-gray-900/50 border border-white/10 rounded-md text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="mt-4 flex items-center justify-end gap-4">
          {feedback && (
            <p className={`text-sm ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {feedback.message}
            </p>
          )}
          <motion.button
            onClick={handleImport}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Importing...' : 'Import Workers'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};