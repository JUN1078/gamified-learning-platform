import { ReactNode } from 'react';
import { cn } from '@/utils/helpers';
import { BadgeTier } from '@/types';

interface BadgeProps {
  children: ReactNode;
  tier?: BadgeTier | 'default';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Badge = ({ children, tier = 'default', className, size = 'md' }: BadgeProps) => {
  const tierClasses = {
    bronze: 'badge-bronze',
    silver: 'badge-silver',
    gold: 'badge-gold',
    default: 'bg-white/20',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        tierClasses[tier],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
