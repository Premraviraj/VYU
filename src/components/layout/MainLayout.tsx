// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../configComponents/sidebar/Sidebar';
import './MainLayout.css';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout; 