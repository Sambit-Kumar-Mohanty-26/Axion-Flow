import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import axionLogo from '../assets/logo.png';
import { Building, User, Lock } from 'lucide-react';

export const WorkerLoginPage = () => {
  const [searchParams] = useSearchParams();
  const [factoryId, setFactoryId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setAuthToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlFactoryId = searchParams.get('factoryId');
    const storedFactoryId = localStorage.getItem('workerFactoryId');

    if (urlFactoryId) {
      setFactoryId(urlFactoryId);
    } else if (storedFactoryId) {
      setFactoryId(storedFactoryId);
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login/worker', {
        factoryId,
        employeeId,
        password,
      });

      localStorage.setItem('workerFactoryId', factoryId);
      setAuthToken(response.data.token);
      navigate('/dashboard');

    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your Factory ID, Employee ID, and Password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden p-4">
      <div className="absolute inset-0 starlight-bg opacity-30 z-0" />
      <div aria-hidden="true" className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/20 rounded-full filter blur-3xl animate-blob-spin"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="relative z-10 w-full max-w-md p-8 space-y-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-3 mb-4">
            <img src={axionLogo} alt="Axion Flow Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold">Axion Flow</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Worker Clock-In</h1>
          <p className="mt-2 text-gray-400">Enter your details to access your dashboard.</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>

          <div>
            <label htmlFor="factoryId" className="block text-xs font-bold text-gray-400 uppercase mb-1">Factory ID</label>
            <div className="relative">
                <Building className="absolute left-3 top-3 text-gray-500" size={18} />
                <input 
                    id="factoryId" 
                    name="factoryId" 
                    type="text" 
                    required 
                    value={factoryId} 
                    onChange={(e) => setFactoryId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    placeholder="e.g. cmj8..."
                />
            </div>
          </div>

          <div>
            <label htmlFor="employeeId" className="block text-xs font-bold text-gray-400 uppercase mb-1">Employee ID</label>
            <div className="relative">
                <User className="absolute left-3 top-3 text-gray-500" size={18} />
                <input 
                    id="employeeId" 
                    name="employeeId" 
                    type="text" 
                    required 
                    value={employeeId} 
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 781"
                />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
            <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>
          )}

          <div>
            <motion.button 
              type="submit" 
              disabled={isLoading} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="w-full mt-2 flex justify-center py-3 px-4 rounded-lg font-bold text-white bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Verifying...' : 'Clock In'}
            </motion.button>
          </div>
        </form>
        
        <div className="text-center pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500">
                Are you a Manager? <Link to="/login" className="text-blue-400 hover:underline">Sign in here</Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
};