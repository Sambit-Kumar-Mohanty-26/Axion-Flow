import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, XCircle, ShieldCheck } from 'lucide-react';
import apiClient from '../api/apiClient'; 

type Status = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ERROR';

export const PendingApprovalPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>('PENDING');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  useEffect(() => {
    if (!email) {
      setStatus('ERROR');
      return;
    }

    let isMounted = true;
    let intervalId: number | null = null;

    const checkStatus = async () => {
      try {
        const response = await apiClient.get(`/auth/status/${email}`);
        const newStatus = response.data.status as Status;
        
        if (!isMounted) return;
        
        setRetryCount(0); 

        if (newStatus === 'APPROVED' || newStatus === 'REJECTED') {
          setStatus(newStatus);
          if (intervalId) clearInterval(intervalId);
        }
      } catch (error) {
        console.error(`Polling attempt ${retryCount + 1} failed:`, error);
        
        if (!isMounted) return;

        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);

        if (nextRetryCount >= MAX_RETRIES) {
          setStatus('ERROR');
          if (intervalId) clearInterval(intervalId);
        }
      }
    };

    checkStatus();
    intervalId = setInterval(checkStatus, 5000); 

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [email, retryCount]);

  useEffect(() => {
    if (status === 'APPROVED') {
      const timer = setTimeout(() => {
        navigate('/login?status=approved'); 
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: <ShieldCheck className="mx-auto h-16 w-16 text-green-400" />,
          title: "Account Approved!",
          message: "Your organization has been successfully verified. Redirecting you to the login page...",
        };
      case 'REJECTED':
        return {
          icon: <XCircle className="mx-auto h-16 w-16 text-red-400" />,
          title: "Verification Failed",
          message: "Our AI agent could not verify your organization's details. Please check your information or contact support.",
        };
      case 'ERROR':
        return {
          icon: <XCircle className="mx-auto h-16 w-16 text-red-400" />,
          title: "An Error Occurred",
          message: "Something went wrong while checking your status. Please try signing up again or contact support.",
        };
      case 'PENDING':
      default:
        return {
          icon: <Loader className="mx-auto h-16 w-16 text-teal-400 animate-spin" />,
          title: "Verification in Progress",
          message: "Our AI Onboarding Agent is verifying your company details. This may take a few moments.",
        };
    }
  };

  const { icon, title, message } = renderContent();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 max-w-lg"
      >
        {icon}
        <h1 className="mt-4 text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-gray-400">{message}</p>
        
        {status === 'PENDING' && (
          <p className="mt-2 text-sm text-gray-500">Please keep this page open. You will be redirected automatically upon approval.</p>
        )}

        {(status === 'REJECTED' || status === 'ERROR') && (
           <Link to="/signup">
            <button className="mt-6 px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">
              Try Signing Up Again
            </button>
          </Link>
        )}
      </motion.div>
    </div>
  );
};