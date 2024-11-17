import React from 'react';
import { useWidgets } from '../../../context/WidgetContext';
import './UserHomePage.css';

const UserHomePage: React.FC = () => {
  const { widgets } = useWidgets();

  return (
    <div className="user-dashboard">
      <h1>Dashboard</h1>
      
      <div className="widgets-container">
        {widgets.map(widget => (
          <div 
            key={widget.id}
            className="widget-item"
            style={{ backgroundColor: widget.backgroundColor || '#ffffff' }}
          >
            <h3>{widget.title}</h3>
            <div 
              className="widget-content"
              dangerouslySetInnerHTML={{ __html: widget.content }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserHomePage; 