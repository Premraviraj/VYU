import React from 'react';

const WeeklyInvoices: React.FC = () => {
  return (
    <div className="invoices-container">
      <div className="invoices-header">
        <h3>Weekly Invoices</h3>
        <span className="invoices-subtitle">From 12 Oct - 24 Nov</span>
      </div>
      <div className="bar-chart">
        {/* Bar chart implementation */}
      </div>
      <div className="invoice-stats">
        <div className="stat-item">
          <span className="stat-label">Minimum</span>
          <span className="stat-value">24,170</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Maximum</span>
          <span className="stat-value">28,170</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyInvoices; 