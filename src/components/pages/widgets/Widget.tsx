import React, { useState } from 'react';
import { vehicleData } from '../../../data/vehicleData';
import VehicleDataModal from '../../modals/VehicleDataModal';
import './Widget.css';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Resizable } from 'react-resizable';
import Draggable from 'react-draggable';
import 'react-resizable/css/styles.css';

interface WidgetProps {
  title: string;
  type: 'bus' | 'car' | 'bike' | 'truck';
  isCustom?: boolean;
  chartType?: string;
  graphData?: {
    data: any[];
  };
  onDelete?: () => void;
}

// Define field limits for each chart type
const chartFieldLimits = {
  line: { min: 1, max: 10, recommended: 5 },
  bar: { min: 1, max: 8, recommended: 6 },
  pie: { min: 2, max: 8, recommended: 6 },
  area: { min: 1, max: 5, recommended: 3 }
};

const Widget: React.FC<WidgetProps> = ({ 
  title, 
  type, 
  isCustom, 
  chartType, 
  graphData,
  onDelete
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [size, setSize] = useState({ width: 400, height: 300 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [chartColors, setChartColors] = useState<string[]>([
    '#6B4DE6', // Primary purple
    '#9B6DFF', // Light purple
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#FF9800', // Orange
    '#E91E63', // Pink
    '#00BCD4', // Cyan
    '#9C27B0'  // Deep purple
  ]);
  const [chartTitle, setChartTitle] = useState(title);
  const [showCustomization, setShowCustomization] = useState(false);
  const [chartConfig, setChartConfig] = useState({
    showLegend: true,
    showGrid: true,
    showTooltip: true,
    theme: 'light',
    fontSize: 12
  });

  const renderChart = () => {
    if (!graphData?.data || !chartType) return null;

    const data = graphData.data.map(item => ({
      name: item.label,
      value: parseFloat(item.value) || 0
    }));

    const getChartContent = () => {
      const chartStyle = {
        width: '100%',
        height: '100%',
        minHeight: '200px',
        flex: 1
      };

      switch (chartType) {
        case 'line':
          return (
            <div style={chartStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                  <XAxis dataKey="name" />
                  <YAxis />
                  {chartConfig.showTooltip && <Tooltip />}
                  {chartConfig.showLegend && <Legend />}
                  <Line type="monotone" dataKey="value" stroke="#6B4DE6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        case 'bar':
          return (
            <BarChart data={data}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              <Bar dataKey="value" fill="#6B4DE6" />
            </BarChart>
          );
        case 'pie':
          return (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#6B4DE6"
                label
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]} 
                  />
                ))}
              </Pie>
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
            </PieChart>
          );
        case 'area':
          return (
            <AreaChart data={data}>
              {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              {chartConfig.showTooltip && <Tooltip />}
              {chartConfig.showLegend && <Legend />}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#6B4DE6"
                fill="#6B4DE6"
                fillOpacity={0.3}
              />
            </AreaChart>
          );
        default:
          return <div>No chart type selected</div>;
      }
    };

    return (
      <div className="resizable-wrapper" style={{ width: '100%', height: '100%' }}>
        <div className="chart-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
          {getChartContent()}
        </div>
        <div className="resize-handle" />
      </div>
    );
  };

  const getIcon = () => {
    if (isCustom && chartType) {
      switch (chartType) {
        case 'line':
          return <i className="fas fa-chart-line"></i>;
        case 'bar':
          return <i className="fas fa-chart-bar"></i>;
        case 'pie':
          return <i className="fas fa-chart-pie"></i>;
        case 'area':
          return <i className="fas fa-chart-area"></i>;
        default:
          return <i className="fas fa-chart-line"></i>;
      }
    }

    switch (type) {
      case 'car':
        return <i className="fas fa-car"></i>;
      case 'bus':
        return <i className="fas fa-bus"></i>;
      case 'bike':
        return <i className="fas fa-bicycle"></i>;
      case 'truck':
        return <i className="fas fa-truck"></i>;
      default:
        return <i className="fas fa-cube"></i>;
    }
  };

  const getVehicleData = () => {
    return vehicleData.find(v => v.vehicleType.toLowerCase().includes(type));
  };

  const data = getVehicleData();

  const getContrastColor = () => {
    switch (type) {
      case 'car':
        return '#2196f3';
      case 'bus':
        return '#9c27b0';
      case 'bike':
        return '#4caf50';
      case 'truck':
        return '#ff9800';
      default:
        return '#333333';
    }
  };

  const renderResizableChart = () => {
    if (!graphData?.data || !chartType) return null;

    return (
      <Draggable
        position={position}
        onStop={(e, data) => setPosition({ x: data.x, y: data.y })}
        bounds="parent"
      >
        <div style={{ position: 'absolute' }}>
          <Resizable
            width={size.width}
            height={size.height}
            onResize={(e, { size: newSize }) => setSize(newSize)}
            minConstraints={[300, 200]}
            maxConstraints={[800, 600]}
          >
            <div style={{ width: size.width, height: size.height }} className="resizable-chart">
              {renderChart()}
              <div className="chart-controls">
                <button 
                  className="customize-btn"
                  onClick={() => setIsCustomizing(!isCustomizing)}
                >
                  <i className="fas fa-palette"></i>
                </button>
                <div className="size-indicator">
                  {size.width}x{size.height}
                </div>
              </div>
            </div>
          </Resizable>
        </div>
      </Draggable>
    );
  };

  const renderCustomizationPanel = () => {
    if (!showCustomization) return null;

    return (
      <div className="chart-customization-panel">
        <div className="customization-header">
          <h4>Chart Customization</h4>
          <button onClick={() => setShowCustomization(false)}>×</button>
        </div>
        
        <div className="customization-content">
          <div className="customization-section">
            <label>Chart Title</label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              className="title-input"
            />
          </div>

          <div className="customization-section">
            <label>Theme</label>
            <select
              value={chartConfig.theme}
              onChange={(e) => setChartConfig(prev => ({ ...prev, theme: e.target.value }))}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="customization-section">
            <label>Font Size</label>
            <input
              type="range"
              min="8"
              max="16"
              value={chartConfig.fontSize}
              onChange={(e) => setChartConfig(prev => ({ 
                ...prev, 
                fontSize: parseInt(e.target.value) 
              }))}
            />
            <span>{chartConfig.fontSize}px</span>
          </div>

          <div className="customization-toggles">
            <label>
              <input
                type="checkbox"
                checked={chartConfig.showLegend}
                onChange={(e) => setChartConfig(prev => ({
                  ...prev,
                  showLegend: e.target.checked
                }))}
              />
              Show Legend
            </label>

            <label>
              <input
                type="checkbox"
                checked={chartConfig.showGrid}
                onChange={(e) => setChartConfig(prev => ({
                  ...prev,
                  showGrid: e.target.checked
                }))}
              />
              Show Grid
            </label>

            <label>
              <input
                type="checkbox"
                checked={chartConfig.showTooltip}
                onChange={(e) => setChartConfig(prev => ({
                  ...prev,
                  showTooltip: e.target.checked
                }))}
              />
              Show Tooltip
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        className={`widget ${type} ${isCustom ? 'custom' : ''}`}
        onClick={() => !isCustom && setIsModalOpen(true)}
      >
        <div className="widget-header" style={{ color: getContrastColor() }}>
          {getIcon()}
          <h3 className="widget-title">{chartTitle}</h3>
          {isCustom && (
            <>
              <button 
                className="customize-chart-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCustomization(!showCustomization);
                }}
              >
                <i className="fas fa-sliders-h"></i>
              </button>
              {onDelete && (
                <button 
                  className="delete-widget-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </>
          )}
        </div>
        <div className="widget-content" style={{ width: '100%', height: '100%' }}>
          {!isCustom ? (
            <div className="widget-summary">
              <span className="total-count">Total: {data?.count}</span>
              <div className="summary-stats">
                <span className="in">In: {data?.in}</span>
                <span className="out">Out: {data?.out}</span>
              </div>
            </div>
          ) : (
            <div className={`widget-chart ${chartConfig.theme}`} style={{ width: '100%', height: '100%' }}>
              {renderChart()}
              {renderCustomizationPanel()}
            </div>
          )}
        </div>
      </div>

      {!isCustom && (
        <VehicleDataModal
          data={data}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default Widget; 