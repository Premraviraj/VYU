import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="stats-header">
      <div className="header-left">
        <h1>Stats</h1>
        <p className="subtitle">MONTHLY UPDATES</p>
      </div>
      <div className="header-right">
        <select className="project-select">
          <option>iOS App Project</option>
        </select>
        <div className="date-nav">
          <button>←</button>
          <span>Today, 12 Dec.</span>
          <button>→</button>
        </div>
      </div>
    </header>
  );
};

export default Header; 