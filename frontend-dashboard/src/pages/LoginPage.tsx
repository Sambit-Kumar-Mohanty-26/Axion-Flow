import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axionLogo from '../assets/logo.png';
import axios from 'axios';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
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
      const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/auth/login`, // Use the full path
    { email, password }
  );
      setAuthToken(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 starlight-bg opacity-30 z-0" />
      <div aria-hidden="true" className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/20 rounded-full filter blur-3xl animate-blob-spin"></div>
      <div aria-hidden="true" className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-500/20 rounded-full filter blur-3xl animate-blob-spin" style={{ animationDelay: '4s', animationDuration: '25s' }}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md p-8 space-y-8 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-3 mb-4">
            <img src={axionLogo} alt="Axion Flow Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold">Axion Flow</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Sign in to your Account</h1>
          <p className="mt-2 text-gray-400">Enter your credentials to access your dashboard.</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md shadow-sm placeholder-gray-500 transition-all duration-300
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-md shadow-sm placeholder-gray-500 transition-all duration-300
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <div>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-blue-500/30 text-sm font-bold text-white 
                         bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <a href="#" className="font-medium text-blue-400 hover:text-blue-300">
            Contact Sales
          </a>
        </p>
      </motion.div>
    </div>
  );
};