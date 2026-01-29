import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastNotification } from '@/types';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'bg-green-500/20 border-green-500',
  error: 'bg-red-500/20 border-red-500',
  info: 'bg-blue-500/20 border-blue-500',
  warning: 'bg-yellow-500/20 border-yellow-500',
};

const Toast = ({ toast }: { toast: ToastNotification }) => {
  const removeToast = useUIStore((state) => state.removeToast);
  const Icon = iconMap[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass-strong rounded-lg p-4 border-l-4 shadow-xl max-w-sm ${colorMap[toast.type]}`}
    >
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{toast.title}</h4>
          <p className="text-sm text-white/70 mt-1">{toast.message}</p>
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const ToastContainer = () => {
  const toasts = useUIStore((state) => state.toasts);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
