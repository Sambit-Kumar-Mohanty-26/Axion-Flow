import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import axionLogo from '../assets/logo.png';
import { CheckCircle, XCircle } from 'lucide-react';

type PageStatus = 'VERIFYING' | 'INVALID' | 'VALID' | 'SUCCESS';

export const WorkerActivationPage = () => {
  const { factoryId } = useParams<{ factoryId: string }>();
  const navigate = useNavigate();

  const [pageStatus, setPageStatus] = useState<PageStatus>('VERIFYING');
  const [employeeId, setEmployeeId] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!factoryId) {
      setPageStatus('INVALID');
    }
  }, [factoryId]);
  
  const handleVerifyId = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/activation/verify-employee', {
        factoryId,
        employeeId,
      });
      setWorkerName(response.data.name);
      setPageStatus('VALID');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please check your Employee ID.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await apiClient.post('/activation/complete', {
        factoryId,
        employeeId,
        password,
      });
      
      setPageStatus('SUCCESS');
      setTimeout(() => navigate(`/worker-login?factoryId=${factoryId}`), 2500);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Activation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (pageStatus) {
      case 'VERIFYING':
        return (
          <form onSubmit={handleVerifyId} className="space-y-4">
            <h1 className="text-2xl font-bold text-white text-center">Activate Your Account</h1>
            <p className="text-center text-gray-400">Enter your Employee ID to begin.</p>
            <div>
              <label htmlFor="employeeId" className="text-sm">Employee ID</label>
              <input id="employeeId" type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required className="mt-1 w-full p-3 bg-white/5 border border-white/10 rounded-md" />
            </div>
            <motion.button type="submit" disabled={isLoading} whileHover={{scale: 1.05}} className="w-full mt-2 p-3 rounded-lg font-bold bg-blue-600 disabled:opacity-50">
              {isLoading ? 'Verifying...' : 'Verify ID'}
            </motion.button>
          </form>
        );
      
      case 'VALID':
        return (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <h1 className="text-2xl font-bold text-white text-center">Welcome, {workerName}!</h1>
            <p className="text-center text-gray-400">Set a password to complete your account activation.</p>
            <div>
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full p-3 bg-white/5 border border-white/10 rounded-md" />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 w-full p-3 bg-white/5 border border-white/10 rounded-md" />
            </div>
            <motion.button type="submit" disabled={isLoading} whileHover={{scale: 1.05}} className="w-full mt-2 p-3 rounded-lg font-bold bg-blue-600 disabled:opacity-50">
              {isLoading ? 'Activating...' : 'Activate Account'}
            </motion.button>
          </form>
        );

      case 'SUCCESS':
        return (
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
            <h1 className="mt-4 text-3xl font-bold">Account Activated!</h1>
            <p className="mt-2 text-gray-400">Redirecting you to the worker login page...</p>
          </div>
        );

      case 'INVALID':
      default:
        return (
          <div className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-400" />
            <h1 className="mt-4 text-3xl font-bold">Invalid Link</h1>
            <p className="mt-2 text-gray-400">This activation link is invalid or has expired.</p>
          </div>
        );
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="absolute inset-0 starlight-bg opacity-30 z-0" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-sm p-8 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl">
        <div className="flex justify-center mb-6">
          <Link to="/"><img src={axionLogo} alt="Axion Flow" className="h-10 w-10" /></Link>
        </div>
        {error && <p className="text-sm text-red-400 text-center mb-4">{error}</p>}
        {renderContent()}
      </motion.div>
    </div>
  );
};