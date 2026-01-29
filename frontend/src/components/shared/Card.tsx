import { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

const Card = ({ children, className, interactive = false, onClick }: CardProps) => {
  return (
    <div
      className={cn(
        interactive ? 'card-interactive' : 'card',
        className
      )}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
