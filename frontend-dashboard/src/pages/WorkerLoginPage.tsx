import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import axionLogo from '../assets/logo.png';
import { useSearchParams } from 'react-router-dom';

export const WorkerLoginPage = () => {
  const [factoryId, setFactoryId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setAuthToken } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login/worker', {
        factoryId,
        employeeId,
        password,
      });

      setAuthToken(response.data.token);

      navigate('/dashboard');

    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your details.");
      console.error("Worker login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const idFromUrl = searchParams.get('factoryId');
    if (idFromUrl) {
      setFactoryId(idFromUrl);
    }
  }, [searchParams]);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden p-4">
      <div className="absolute inset-0 starlight-bg opacity-30 z-0" />
      <div aria-hidden="true" className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/20 rounded-full filter blur-3xl animate-blob-spin"></div>
      <div aria-hidden="true" className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-500/20 rounded-full filter blur-3xl animate-blob-spin" style={{ animationDelay: '4s', animationDuration: '25s' }}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md p-8 space-y-6 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-3 mb-4">
            <img src={axionLogo} alt="Axion Flow Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold">Axion Flow</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Worker Sign In</h1>
          <p className="mt-2 text-gray-400">Enter your details to clock in.</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="factoryId" className="block text-sm font-medium text-gray-300">Factory ID</label>
            <input id="factoryId" name="factoryId" type="text" required value={factoryId} onChange={(e) => setFactoryId(e.target.value) } readOnly
              className="mt-1 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-300">Employee ID</label>
            <input id="employeeId" name="employeeId" type="text" required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
              className="mt-1 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password / PIN</label>
            <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {error && (<p className="text-sm text-red-400 text-center">{error}</p>)}

          <div>
            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="w-full mt-2 flex justify-center py-3 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 transition-all">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-400">
          Manager or Admin?{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};