import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axionLogo from '../assets/logo.png';
import apiClient from '../api/apiClient';

export const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await apiClient.post('/auth/register',{
        email,
        password,
        organizationName,
      });

      navigate(`/pending-approval?email=${encodeURIComponent(email)}`);

    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again later.");
      }
      console.error("Signup failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Create your Company Account</h1>
          <p className="mt-2 text-gray-400">Get started with Axion Flow in minutes.</p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-300">Company Name</label>
            <input 
              id="organizationName" 
              name="organizationName" 
              type="text" 
              required 
              value={organizationName} 
              onChange={(e) => setOrganizationName(e.target.value)}
              className="mt-1 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Your Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          {error && (<p className="text-sm text-red-400 text-center py-2">{error}</p>)}

          <div>
            <motion.button 
              type="submit" 
              disabled={isLoading} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="w-full mt-2 flex justify-center py-3 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Submitting for Verification...' : 'Sign Up & Begin Verification'}
            </motion.button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};