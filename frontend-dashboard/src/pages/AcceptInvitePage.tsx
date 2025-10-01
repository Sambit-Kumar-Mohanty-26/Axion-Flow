import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import axionLogo from '../assets/logo.png';
import { MailCheck, CheckCircle, XCircle, Loader } from 'lucide-react';

type PageStatus = 'VERIFYING' | 'INVALID' | 'VALID' | 'SUCCESS';

export const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();

  const [pageStatus, setPageStatus] = useState<PageStatus>('VERIFYING');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setPageStatus('INVALID');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/invites/verify/${token}`);
        setEmail(response.data.email);
        setPageStatus('VALID');
      } catch (err) {
        console.error("Invalid token:", err);
        setPageStatus('INVALID');
      }
    };

    verifyToken();
  }, [token]);

  const handleActivation = async (event: React.FormEvent) => {
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
      const response = await axios.post('http://localhost:3001/api/invites/accept', {
        token,
        password,
      });
      setAuthToken(response.data.token); 

      setPageStatus('SUCCESS');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Activation failed. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (pageStatus) {
      case 'VERIFYING':
        return <div className="text-center"><Loader className="mx-auto h-12 w-12 animate-spin" /> <p className="mt-4">Verifying invitation...</p></div>;
      
      case 'INVALID':
        return <div className="text-center"><XCircle className="mx-auto h-12 w-12 text-red-400" /><h1 className="mt-4 text-2xl font-bold">Invalid Invitation</h1><p className="mt-2 text-gray-400">This link is invalid or has expired. Please request a new invitation.</p></div>;
      
      case 'SUCCESS':
        return <div className="text-center"><CheckCircle className="mx-auto h-12 w-12 text-green-400" /><h1 className="mt-4 text-2xl font-bold">Account Activated!</h1><p className="mt-2 text-gray-400">Welcome to Axion Flow. Redirecting you to your dashboard...</p></div>;

      case 'VALID':
        return (
          <>
            <div className="text-center">
              <MailCheck className="mx-auto h-10 w-10 text-teal-400" />
              <h1 className="text-2xl font-bold mt-4">Welcome to the Team!</h1>
              <p className="text-gray-400 mt-2">Activate your account for <span className="font-semibold text-white">{email}</span> by setting a password.</p>
            </div>
            <form onSubmit={handleActivation} className="space-y-4 mt-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full p-3 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">Confirm Password</label>
                <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 w-full p-3 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <motion.button type="submit" disabled={isLoading} whileHover={{scale: 1.05}} className="w-full mt-2 p-3 rounded-lg font-bold bg-blue-600 disabled:opacity-50">
                {isLoading ? 'Activating...' : 'Set Password & Log In'}
              </motion.button>
            </form>
          </>
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