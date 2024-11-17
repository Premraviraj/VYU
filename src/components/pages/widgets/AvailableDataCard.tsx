import React from 'react';
import './AvailableDataCard.css';

interface AvailableDataCardProps {
  title: string;
  description?: string;
  dataPoints: string[];
}

const AvailableDataCard: React.FC<AvailableDataCardProps> = ({ title, description, dataPoints }) => {
  return (
    <div className="available-data-card">
      <div className="available-data-header">
        <h3>{title}</h3>
        {description && <p className="data-description">{description}</p>}
      </div>
      <div className="data-points-container">
        {dataPoints.map((point, index) => (
          <div key={index} className="data-point">
            <span className="data-point-icon">📊</span>
            <span className="data-point-text">{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableDataCard; 