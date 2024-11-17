import React, { useState } from 'react';
import { VehicleStats } from '../../../data/vehicleData';
import Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsReact from 'highcharts-react-official';
import { useGraphs } from '../../../context/GraphContext';
import './GraphModal.css';

// Initialize Highcharts modules
HighchartsMore(Highcharts);

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedData: VehicleStats[];
}

type GraphType = 'line' | 'bar' | 'pie' | 'area' | 'spline' | 'butterfly' | 'nightingale' | 'waterfall' | 'radar';

const GraphModal: React.FC<GraphModalProps> = ({ isOpen, onClose, selectedData }) => {
  const [selectedGraphType, setSelectedGraphType] = useState<GraphType>('line');
  const [chartOptions, setChartOptions] = useState<Highcharts.Options | null>(null);
  const { addGraph } = useGraphs();

  const graphOptions = [
    { type: 'line', label: 'Line Graph', icon: '📈' },
    { type: 'bar', label: 'Bar Chart', icon: '📊' },
    { type: 'pie', label: 'Pie Chart', icon: '🥧' },
    { type: 'area', label: 'Area Chart', icon: '📉' },
    { type: 'spline', label: 'Spline Chart', icon: '💫' },
    { type: 'butterfly', label: 'Butterfly Chart', icon: '🦋' },
    { type: 'nightingale', label: 'Nightingale Chart', icon: '🌸' },
    { type: 'waterfall', label: 'Waterfall Chart', icon: '🌊' },
    { type: 'radar', label: 'Radar Chart', icon: '🎯' },
  ] as const;

  const generateChartOptions = (type: GraphType): Highcharts.Options => {
    const timePoints = ['morning', 'afternoon', 'evening', 'night'];
    
    switch (type) {
      case 'bar':
        return {
          chart: {
            type: 'bar',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Vehicle Statistics'
          },
          xAxis: {
            categories: selectedData.map(d => d.vehicleType)
          },
          yAxis: {
            title: {
              text: 'Count'
            }
          },
          series: [{
            name: 'Total Count',
            type: 'bar',
            data: selectedData.map(d => d.count),
            color: '#6B4DE6'
          }, {
            name: 'Vehicles In',
            type: 'bar',
            data: selectedData.map(d => d.in),
            color: '#059669'
          }, {
            name: 'Vehicles Out',
            type: 'bar',
            data: selectedData.map(d => d.out),
            color: '#dc2626'
          }]
        };

      case 'pie':
        return {
          chart: {
            type: 'pie',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Vehicle Distribution'
          },
          series: [{
            name: 'Total Count',
            type: 'pie',
            data: selectedData.map(d => ({
              name: d.vehicleType,
              y: d.count,
              color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
            }))
          }]
        };

      case 'area':
        return {
          chart: {
            type: 'area',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Time Distribution'
          },
          xAxis: {
            categories: timePoints
          },
          yAxis: {
            title: {
              text: 'Count'
            }
          },
          series: selectedData.map(vehicle => ({
            name: vehicle.vehicleType,
            type: 'area',
            data: [
              vehicle.details.morning.in,
              vehicle.details.afternoon.in,
              vehicle.details.evening.in,
              vehicle.details.night.in
            ]
          }))
        };

      case 'spline':
        return {
          chart: {
            type: 'spline',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Time Trend'
          },
          xAxis: {
            categories: timePoints
          },
          yAxis: {
            title: {
              text: 'Count'
            }
          },
          series: selectedData.map(vehicle => ({
            name: vehicle.vehicleType,
            type: 'spline',
            data: [
              vehicle.details.morning.in,
              vehicle.details.afternoon.in,
              vehicle.details.evening.in,
              vehicle.details.night.in
            ]
          }))
        };

      case 'butterfly':
        return {
          chart: {
            type: 'bar',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Vehicle In/Out Distribution'
          },
          xAxis: {
            categories: selectedData.map(d => d.vehicleType)
          },
          yAxis: {
            title: {
              text: 'Count'
            }
          },
          plotOptions: {
            series: {
              stacking: 'normal'
            }
          },
          series: [{
            name: 'Vehicles In',
            type: 'bar',
            data: selectedData.map(d => d.in),
            color: '#059669'
          }, {
            name: 'Vehicles Out',
            type: 'bar',
            data: selectedData.map(d => -d.out),
            color: '#dc2626'
          }]
        };

      case 'nightingale':
        return {
          chart: {
            polar: true,
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Time Distribution (Nightingale)'
          },
          pane: {
            startAngle: 0,
            endAngle: 360
          },
          xAxis: {
            categories: timePoints,
            tickmarkPlacement: 'on',
            lineWidth: 0
          },
          yAxis: {
            min: 0
          },
          plotOptions: {
            column: {
              pointPadding: 0,
              groupPadding: 0
            }
          },
          series: selectedData.map(vehicle => ({
            name: vehicle.vehicleType,
            type: 'column',
            data: [
              vehicle.details.morning.in,
              vehicle.details.afternoon.in,
              vehicle.details.evening.in,
              vehicle.details.night.in
            ]
          }))
        };

      case 'waterfall':
        return {
          chart: {
            type: 'waterfall',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Vehicle Flow Analysis'
          },
          xAxis: {
            categories: ['Initial', ...timePoints, 'Total']
          },
          yAxis: {
            title: {
              text: 'Count'
            }
          },
          plotOptions: {
            waterfall: {
              color: '#6B4DE6',
              negativeColor: '#dc2626',
              borderColor: '#374151'
            }
          },
          series: [{
            name: 'Flow',
            type: 'waterfall',
            data: selectedData.map(vehicle => [
              { name: 'Initial', y: 0 },
              { name: 'Morning', y: vehicle.details.morning.in - vehicle.details.morning.out },
              { name: 'Afternoon', y: vehicle.details.afternoon.in - vehicle.details.afternoon.out },
              { name: 'Evening', y: vehicle.details.evening.in - vehicle.details.evening.out },
              { name: 'Night', y: vehicle.details.night.in - vehicle.details.night.out },
              {
                name: 'Total',
                isSum: true,
                color: '#6B4DE6'
              }
            ])[0]
          }]
        };

      case 'radar':
        return {
          chart: {
            polar: true,
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Vehicle Distribution Analysis'
          },
          pane: {
            size: '80%'
          },
          xAxis: {
            categories: timePoints,
            tickmarkPlacement: 'on',
            lineWidth: 0
          },
          yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
          },
          plotOptions: {
            series: {
              pointPlacement: 'on'
            }
          },
          series: selectedData.map(vehicle => ({
            name: vehicle.vehicleType,
            type: 'line',
            data: [
              vehicle.details.morning.in,
              vehicle.details.afternoon.in,
              vehicle.details.evening.in,
              vehicle.details.night.in
            ]
          }))
        };

      case 'line':
        return {
          chart: {
            type: 'line',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Time Distribution'
          },
          xAxis: {
            categories: timePoints,
            title: {
              text: 'Time of Day'
            }
          },
          yAxis: {
            title: {
              text: 'Count'
            },
            min: 0
          },
          plotOptions: {
            line: {
              marker: {
                enabled: true,
                symbol: 'circle',
                radius: 4
              },
              lineWidth: 2
            }
          },
          series: selectedData.map(vehicle => ({
            name: vehicle.vehicleType,
            type: 'line',
            data: [
              vehicle.details.morning.in,
              vehicle.details.afternoon.in,
              vehicle.details.evening.in,
              vehicle.details.night.in
            ]
          }))
        };

      default:
        return {
          chart: {
            type: 'line',
            backgroundColor: 'transparent'
          },
          title: {
            text: 'Time Distribution'
          },
          xAxis: {
            categories: timePoints
          },
          yAxis: {
            title: {
              text: 'Count'
            }
          },
          series: selectedData.map(vehicle => ({
            name: vehicle.vehicleType,
            type: 'line',
            data: [
              vehicle.details.morning.in,
              vehicle.details.afternoon.in,
              vehicle.details.evening.in,
              vehicle.details.night.in
            ]
          }))
        };
    }
  };

  const handleGraphTypeSelect = (type: GraphType) => {
    setSelectedGraphType(type);
    const options = generateChartOptions(type);
    setChartOptions(options);
  };

  const handleGenerateGraph = () => {
    if (chartOptions) {
      // Create a container div with exact dimensions
      const container = document.createElement('div');
      container.style.width = '400px';
      container.style.height = '300px';
      document.body.appendChild(container);

      // Create the chart with exact same options as preview
      const chart = Highcharts.chart(container, {
        ...chartOptions,
        chart: {
          ...chartOptions.chart,
          width: 400,
          height: 300,
          animation: false,
          style: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          }
        },
        credits: {
          enabled: false
        },
        title: {
          ...chartOptions.title,
          style: {
            fontSize: '16px',
            fontWeight: '500'
          }
        },
        xAxis: {
          ...chartOptions.xAxis,
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        },
        yAxis: {
          ...chartOptions.yAxis,
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        },
        plotOptions: {
          ...chartOptions.plotOptions,
          series: {
            ...chartOptions.plotOptions?.series,
            animation: false
          }
        }
      });

      // Get the SVG
      const svg = chart.container.querySelector('svg')?.outerHTML;
      
      // Clean up
      chart.destroy();
      document.body.removeChild(container);

      if (svg) {
        // Add the SVG wrapper with exact dimensions and styles
        const wrappedSvg = `
          <div style="
            width: 400px; 
            height: 300px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          ">
            ${svg}
          </div>
        `;
        addGraph(wrappedSvg);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="graph-modal-overlay">
      <div className="graph-modal">
        <div className="graph-modal-header">
          <h2>Generate Graph</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="graph-modal-content">
          <div className="graph-options">
            {graphOptions.map(({ type, label, icon }) => (
              <button
                key={type}
                className={`graph-option ${selectedGraphType === type ? 'selected' : ''}`}
                onClick={() => handleGraphTypeSelect(type)}
              >
                <span className="graph-icon">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          <div className="graph-preview">
            <h3>Preview</h3>
            {chartOptions ? (
              <div style={{ width: '400px', height: '300px' }}>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={{
                    ...chartOptions,
                    chart: {
                      ...chartOptions.chart,
                      width: 400,
                      height: 300
                    },
                    credits: {
                      enabled: false
                    }
                  }}
                />
              </div>
            ) : (
              <div className="no-preview">Select a graph type to see preview</div>
            )}
          </div>
        </div>

        <div className="graph-modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button 
            className="generate-button"
            onClick={handleGenerateGraph}
            disabled={!chartOptions}
          >
            Generate Graph
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphModal; 