import React, { useState, useEffect, useRef } from 'react';
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
  const [layouts, setLayouts] = useState<{ [key: string]: LayoutItem[] }>({});
  const graphRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const generateLayout = () => {
    const layout = [
      // KPI cards layout
      ...kpiCards.map((_, index) => ({
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
      })),
      // Graphs layout
      ...generatedGraphs.map((_, index) => ({
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
      }))
    ];
    return layout;
  };

  const handleLayoutChange = (currentLayout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    setLayouts(allLayouts as { [key: string]: LayoutItem[] });
  };

  const gridItems = [
    ...kpiCards.map((card, index) => (
      <div key={`kpi-${index}`} data-grid={{ 
        x: (index % 3) * 4,
        y: Math.floor(index / 3) * 4,
        w: 4,
        h: 3,
        minW: 3,
        maxW: 6,
        minH: 3,
        maxH: 4
      }}>
        <div className="card-header">
          <h3>{card.title}</h3>
          <button
            className="remove-btn"
            onClick={() => removeKPICard(card.id)}
          >
            ×
          </button>
        </div>
        <div className="card-content">
          {/* KPI card content */}
        </div>
      </div>
    )),
    ...generatedGraphs.map((graphSvg, index) => (
      <div key={`graph-${index}`} data-grid={{
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 6 + Math.ceil(kpiCards.length / 3) * 4,
        w: 6,
        h: 5,
        minW: 4,
        maxW: 12,
        minH: 4,
        maxH: 8
      }}>
        <div className="card-header">
          <h3>Generated Graph {index + 1}</h3>
          <button
            className="remove-btn"
            onClick={() => removeGraph(index)}
          >
            ×
          </button>
        </div>
        <div 
          ref={el => graphRefs.current[`graph-${index}`] = el}
          className="card-content graph-content"
          dangerouslySetInnerHTML={{ __html: graphSvg }}
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
            layouts={{ lg: generateLayout() }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            width={1200}
            margin={[16, 16]}
            containerPadding={[16, 16]}
            isDraggable={true}
            isResizable={true}
            onLayoutChange={handleLayoutChange}
            compactType="vertical"
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
