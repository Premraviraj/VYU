import React from 'react';
import './StackLoader.css';

interface StackLoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const StackLoader: React.FC<StackLoaderProps> = ({ 
  size = 'medium',
  color = 'var(--primary-color)' 
}) => {
  return (
    <div className={`stack-loader ${size}`}>
      <div className="stack-plates" style={{ '--loader-color': color } as any}>
        <div className="plate"></div>
        <div className="plate"></div>
        <div className="plate"></div>
      </div>
      <div className="loader-shadow"></div>
    </div>
  );
};

export default StackLoader; 