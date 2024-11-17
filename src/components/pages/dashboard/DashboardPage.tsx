import React, { useState, useRef, useEffect } from 'react';
import { useGraphs } from '../../../context/GraphContext';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DashboardPage.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface LayoutItem extends Layout {
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
}

const DashboardPage: React.FC = () => {
  const { generatedGraphs, removeGraph, kpiCards, removeKPICard } = useGraphs();
  const graphRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Initialize layout from localStorage
  const [currentLayout, setCurrentLayout] = useState<LayoutItem[]>(() => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    return savedLayout ? JSON.parse(savedLayout) : [];
  });

  // Save layout to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('dashboardLayout', JSON.stringify(currentLayout));
  }, [currentLayout]);

  // Fixed parameter order - required parameters first, optional parameters last
  const handleRemoveWidget = (type: 'graph' | 'kpi', index: number, event: React.MouseEvent, id?: string) => {
    // Prevent drag and other events
    event.preventDefault();
    event.stopPropagation();
    
    // First, remove from layout
    const widgetId = `${type}-${index}`;
    setCurrentLayout(prev => prev.filter(item => item.i !== widgetId));

    // Then, remove from data
    if (type === 'graph') {
      removeGraph(index);
    } else {
      if (id) removeKPICard(id);
    }

    // Clean up refs if it's a graph
    if (type === 'graph') {
      delete graphRefs.current[widgetId];
    }
  };

  // Generate initial layout for new items only
  const generateLayoutForNewItems = (): LayoutItem[] => {
    const existingIds = new Set(currentLayout.map(item => item.i));
    const newLayout: LayoutItem[] = [...currentLayout];

    // Add layout for new KPI cards
    kpiCards.forEach((_, index) => {
      const id = `kpi-${index}`;
      if (!existingIds.has(id)) {
        newLayout.push({
          i: id,
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
      }
    });

    // Add layout for new graphs
    generatedGraphs.forEach((_, index) => {
      const id = `graph-${index}`;
      if (!existingIds.has(id)) {
        newLayout.push({
          i: id,
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
      }
    });

    return newLayout;
  };

  // Update layout when items change
  useEffect(() => {
    setCurrentLayout(generateLayoutForNewItems());
  }, [kpiCards.length, generatedGraphs.length]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setCurrentLayout(newLayout as LayoutItem[]);
  };

  const gridItems = [
    ...kpiCards.map((card, index) => (
      <div key={`kpi-${index}`} className="widget-container">
        <div className="card-header">
          <h3>{card.title}</h3>
          <button
            className="remove-btn"
            onClick={(e) => handleRemoveWidget('kpi', index, e, card.id)}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="Remove widget"
          >
            ×
          </button>
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
          <h3>{graph.title || `Graph ${index + 1}`}</h3>
          <button
            className="remove-btn"
            onClick={(e) => handleRemoveWidget('graph', index, e)}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="Remove widget"
          >
            ×
          </button>
        </div>
        <div 
          ref={el => graphRefs.current[`graph-${index}`] = el}
          className="card-content graph-content"
          dangerouslySetInnerHTML={{ __html: graph.svg }}
        />
      </div>
    ))
  ];

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
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
        <div className="no-content">
          <p>No content yet. Go to Widgets to create cards and graphs!</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;