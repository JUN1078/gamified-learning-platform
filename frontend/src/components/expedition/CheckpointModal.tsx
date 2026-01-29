import { motion, AnimatePresence } from 'framer-motion';
import { Checkpoint } from '@/types';
import { X, CheckCircle, Lock } from 'lucide-react';
import Button from '@/components/shared/Button';
import { cn } from '@/utils/helpers';

interface CheckpointModalProps {
  isOpen: boolean;
  checkpoint: Checkpoint | null;
  onClose: () => void;
  onComplete?: () => void;
  canComplete: boolean;
}

const CheckpointModal = ({
  isOpen,
  checkpoint,
  onClose,
  onComplete,
  canComplete,
}: CheckpointModalProps) => {
  if (!checkpoint) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative glass-strong rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-auto custom-scrollbar"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start space-x-4 mb-6">
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  checkpoint.isCompleted
                    ? 'bg-green-500/20 text-green-400'
                    : canComplete
                    ? 'bg-accent-gold/20 text-accent-gold'
                    : 'bg-white/10 text-white/50'
                )}
              >
                {checkpoint.isCompleted ? (
                  <CheckCircle className="w-8 h-8" />
                ) : canComplete ? (
                  <span className="text-2xl font-bold">{checkpoint.order}</span>
                ) : (
                  <Lock className="w-8 h-8" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-bold mb-2">
                  {checkpoint.name}
                </h2>
                <p className="text-white/70">{checkpoint.description}</p>
              </div>
            </div>

            {/* Required Attributes */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-lg">Required Attributes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {checkpoint.requiredAttributes.map((req) => (
                  <div
                    key={req.attribute}
                    className="glass rounded-lg p-3 flex items-center justify-between"
                  >
                    <span className="text-sm capitalize">
                      {req.attribute.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-semibold text-accent-gold">
                      {req.minValue}+
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards */}
            {checkpoint.rewards.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-lg">Rewards</h3>
                <div className="space-y-2">
                  {checkpoint.rewards.map((reward, index) => (
                    <div
                      key={index}
                      className="glass rounded-lg p-3 flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center">
                        <span className="text-lg">🎁</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{reward.description}</p>
                        <p className="text-xs text-white/50 capitalize">{reward.type}</p>
                      </div>
                      <span className="font-bold text-accent-gold">{reward.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              {!checkpoint.isCompleted && (
                <Button
                  variant="primary"
                  disabled={!canComplete}
                  onClick={onComplete}
                >
                  {canComplete ? 'Complete Checkpoint' : 'Requirements Not Met'}
                </Button>
              )}
              {checkpoint.isCompleted && (
                <div className="px-6 py-3 rounded-lg bg-green-500/20 text-green-400 font-semibold">
                  Completed ✓
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckpointModal;
