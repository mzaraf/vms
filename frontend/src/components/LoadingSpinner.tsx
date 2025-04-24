import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullPage = false, 
  size = 24,
  className = ''
}) => {
  if (fullPage) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className={`h-${size} w-${size} animate-spin ${className}`} />
      </div>
    );
  }

  return <Loader2 className={`h-${size} w-${size} animate-spin ${className}`} />;
};

export default LoadingSpinner;