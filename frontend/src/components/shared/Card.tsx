import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/utils/helpers';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

const Card = ({ children, className, interactive = false, onClick, style }: CardProps) => {
  return (
    <div
      className={cn(
        interactive ? 'card-interactive' : 'card',
        className
      )}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;
