import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X, AlertTriangle } from 'lucide-react';
import { useState, createContext, useContext, type ReactNode, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning';
interface Toast { id: string; message: string; type: ToastType; }
interface ToastContextType { showToast: (message: string, type: ToastType) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);
const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const styles = {
    success: 'bg-gray-900/90 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    error: 'bg-gray-900/90 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    warning: 'bg-gray-900/90 border-yellow-500/50 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]',
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative flex items-center gap-4 px-5 py-4 rounded-xl border backdrop-blur-md overflow-hidden ${styles[toast.type]}`}
    >
      <div className="shrink-0">{icons[toast.type]}</div>
      <span className="text-sm font-bold tracking-wide text-white/90">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="ml-4 text-white/50 hover:text-white transition-colors">
        <X size={16} />
      </button>

      <motion.div 
        initial={{ width: "100%" }} 
        animate={{ width: "0%" }} 
        transition={{ duration: 4, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-1 ${
          toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
        }`}
      />
    </motion.div>
  );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 items-end">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};