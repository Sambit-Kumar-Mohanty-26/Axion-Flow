import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Link as LinkIcon, Copy, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';

export const WorkersPage = () => {
  const { user } = useAuth(); 
  const [pastedData, setPastedData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFeedback(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });

      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      let startRow = 0;
      if (data[0] && (typeof data[0][0] === 'string' && data[0][0].toLowerCase().includes('name'))) {
          startRow = 1;
      }

      let parsedText = "";
      for (let i = startRow; i < data.length; i++) {
          const row = data[i];
          if (row[0] && row[1]) {
              parsedText += `${row[0]}, ${row[1]}\n`;
          }
      }

      setPastedData(parsedText);
      setFeedback({ type: 'success', message: `Loaded ${data.length - startRow} rows from Excel. Review below.` });
    };
    reader.readAsBinaryString(file);
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
      setFileName(null);
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
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <UploadCloud /> Bulk Import Workers
        </h2>

        <div className="mb-6">
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload} 
                accept=".xlsx, .xls, .csv"
                className="hidden"
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-blue-400 transition-colors bg-gray-900/30"
            >
                {fileName ? (
                    <>
                        <FileSpreadsheet size={32} className="text-green-500 mb-2"/>
                        <span className="text-white font-semibold">{fileName}</span>
                        <span className="text-xs text-gray-500">Click to change file</span>
                    </>
                ) : (
                    <>
                        <FileSpreadsheet size={32} className="mb-2"/>
                        <span className="font-semibold">Upload Excel / CSV</span>
                        <span className="text-xs text-gray-500">Columns: Name, EmployeeID</span>
                    </>
                )}
            </button>
        </div>

        <div className="flex items-center gap-4 mb-2">
             <div className="h-px bg-gray-700 flex-1"></div>
             <span className="text-xs text-gray-500 uppercase">OR PASTE MANUALLY</span>
             <div className="h-px bg-gray-700 flex-1"></div>
        </div>

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

        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1">
            {feedback && (
                <div className={`flex items-center gap-2 text-sm ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {feedback.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                    {feedback.message}
                </div>
            )}
          </div>

          <motion.button
            onClick={handleImport}
            disabled={isLoading || !pastedData}
            whileHover={{ scale: 1.05 }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Importing...' : 'Import Workers'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};