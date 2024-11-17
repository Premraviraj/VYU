import React from 'react';

const TimeLogGraph: React.FC = () => {
  return (
    <div className="graph-container">
      <div className="graph-header">
        <h3>Daily Time Log Activity</h3>
        <span className="graph-subtitle">Today vs Yesterday</span>
      </div>
      <div className="time-graph">
        {/* We'll need to use a charting library like recharts or chart.js */}
        <div className="graph-y-axis">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="y-axis-label">{10-i*2}h</div>
          ))}
        </div>
        <div className="graph-x-axis">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
            <div key={month} className="x-axis-label">{month}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeLogGraph; 