import { motion } from 'framer-motion';
import { User, Check, Clock } from 'lucide-react';
import { EmployeeListItem } from '@/types';
import Card from '@/components/shared/Card';

interface EmployeeCardProps {
  employee: EmployeeListItem;
  onStartReview: (employee: EmployeeListItem) => void;
}

const EmployeeCard = ({ employee, onStartReview }: EmployeeCardProps) => {
  const { username, email, hasReviewed, lastReviewDate, avatar } = employee;

  return (
    <Card className="group hover:scale-105 transition-transform duration-200 cursor-pointer">
      <div className="flex flex-col items-center text-center p-4">
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-purple to-primary-pink flex items-center justify-center overflow-hidden">
            {avatar ? (
              <img src={avatar} alt={username} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          {/* Status Badge */}
          {hasReviewed && (
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-dark-800">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Employee Info */}
        <h3 className="font-display font-bold text-lg mb-1">{username}</h3>
        <p className="text-sm text-white/70 mb-4">{email}</p>

        {/* Review Status */}
        {hasReviewed && lastReviewDate ? (
          <div className="flex items-center gap-2 text-sm text-green-400 mb-4">
            <Clock className="w-4 h-4" />
            <span>
              Reviewed{' '}
              {new Date(lastReviewDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        ) : (
          <div className="text-sm text-white/50 mb-4">Not reviewed yet</div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onStartReview(employee)}
          className={`w-full ${
            hasReviewed
              ? 'btn-secondary text-sm'
              : 'btn-primary text-sm'
          }`}
        >
          {hasReviewed ? 'Re-Review' : 'Start Review'}
        </button>
      </div>
    </Card>
  );
};

export default EmployeeCard;
