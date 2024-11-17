import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useGraphs } from '../../../context/GraphContext';
import Sidebar from '../../configComponents/sidebar/Sidebar';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './UserHomePage.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface LayoutItem extends Layout {
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

const UserHomePage: React.FC = () => {
  const { userRole } = useAuth();
  const { generatedGraphs, kpiCards } = useGraphs();
  const [currentLayout, setCurrentLayout] = useState<LayoutItem[]>(() => {
    const savedLayout = localStorage.getItem('userDashboardLayout');
    return savedLayout ? JSON.parse(savedLayout) : [];
  });

  // Generate layout for items
  const generateLayout = (): LayoutItem[] => {
    const layout: LayoutItem[] = [];

    // Add layout for KPI cards
    kpiCards.forEach((_, index) => {
      layout.push({
        i: `kpi-${index}`,
        x: (index % 3) * 4,
        y: Math.floor(index / 3) * 4,
        w: 4,
        h: 3,
        minW: 3,
        maxW: 6,
        minH: 3,
        maxH: 4,
        static: false
      });
    });

    // Add layout for graphs
    generatedGraphs.forEach((_, index) => {
      layout.push({
        i: `graph-${index}`,
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 6 + Math.ceil(kpiCards.length / 3) * 4,
        w: 6,
        h: 5,
        minW: 4,
        maxW: 12,
        minH: 4,
        maxH: 8,
        static: false
      });
    });

    return layout;
  };

  // Update layout when items change
  useEffect(() => {
    setCurrentLayout(generateLayout());
  }, [kpiCards.length, generatedGraphs.length]);

  // Save layout to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('userDashboardLayout', JSON.stringify(currentLayout));
  }, [currentLayout]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setCurrentLayout(newLayout as LayoutItem[]);
  };

  const gridItems = [
    ...kpiCards.map((card, index) => (
      <div key={`kpi-${index}`} className="widget-container">
        <div className="card-header">
          <h3>{card.title}</h3>
        </div>
        <div className="card-content">
          <div className="main-stat">
            <span className="value">{card.data.total}</span>
            <span className="label">Total Vehicles</span>
          </div>
          <div className="stats-grid">
            <div className="stat in">
              <span className="value">{card.data.in}</span>
              <span className="label">In</span>
            </div>
            <div className="stat out">
              <span className="value">{card.data.out}</span>
              <span className="label">Out</span>
            </div>
          </div>
        </div>
      </div>
    )),
    ...generatedGraphs.map((graph, index) => (
      <div key={`graph-${index}`} className="widget-container">
        <div className="card-header">
          <h3>{graph.title}</h3>
        </div>
        <div 
          className="card-content graph-content"
          dangerouslySetInnerHTML={{ __html: graph.svg }}
        />
      </div>
    ))
  ];

  return (
    <div className="user-layout">
      <Sidebar />
      <div className="user-content">
        <div className="user-container">
          <h1>User Dashboard</h1>
          {(kpiCards.length > 0 || generatedGraphs.length > 0) ? (
            <div style={{ width: '100%', position: 'relative' }}>
              <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: currentLayout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                width={1200}
                margin={[16, 16]}
                containerPadding={[16, 16]}
                isDraggable={true}
                isResizable={true}
                onLayoutChange={handleLayoutChange}
                compactType={null}
              >
                {gridItems}
              </ResponsiveGridLayout>
            </div>
          ) : (
            <div className="no-widgets-message">
              <p>No widgets available. Please contact admin to create widgets.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHomePage; 