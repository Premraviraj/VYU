import React, { useState } from 'react';
import { VehicleStats } from '../../../data/vehicleData';
import { useWidgets } from '../../../context/WidgetContext';
import './KPIModal.css';

interface KPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedData: VehicleStats[];
  onKPICreated?: () => void;
}

type KPIDesign = 'basic' | 'detailed' | 'compact' | 'modern' | 'minimal';

const KPIModal: React.FC<KPIModalProps> = ({ isOpen, onClose, selectedData, onKPICreated }) => {
  const [kpiTitle, setKpiTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedKPIType, setSelectedKPIType] = useState<string>('basic');
  const { addWidget } = useWidgets();

  const pastelColors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Pastel Blue', value: '#E3F2FD' },
    { name: 'Pastel Purple', value: '#F3E5F5' },
    { name: 'Pastel Green', value: '#E8F5E9' },
    { name: 'Pastel Yellow', value: '#FFFDE7' },
    { name: 'Pastel Pink', value: '#FCE4EC' },
    { name: 'Pastel Orange', value: '#FFF3E0' }
  ];

  const kpiTypes = [
    {
      type: 'basic',
      label: 'Basic Stats',
      icon: '📊',
      description: 'Clean and simple layout with key metrics'
    },
    {
      type: 'modern',
      label: 'Modern Design',
      icon: '✨',
      description: 'Contemporary style with gradient effects'
    },
    {
      type: 'compact',
      label: 'Compact View',
      icon: '📱',
      description: 'Space-efficient design for essential data'
    },
    {
      type: 'detailed',
      label: 'Detailed Stats',
      icon: '📈',
      description: 'Comprehensive view with all metrics'
    },
    {
      type: 'minimal',
      label: 'Minimal Design',
      icon: '⚡',
      description: 'Clean, minimalistic approach'
    }
  ];

  const getKPIContent = (type: string) => {
    switch (type) {
      case 'basic':
        return selectedData.map(vehicle => `
          <div style="
            margin-bottom: 1rem;
            padding: 1.5rem;
            background: ${selectedColor === '#ffffff' ? '#f9fafb' : '#ffffff'};
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          ">
            <h3 style="margin: 0 0 1rem 0; color: #1e293b; font-size: 1.2rem;">${vehicle.vehicleType}</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
              <div>
                <div style="font-size: 1.5rem; font-weight: 600; color: #4f46e5;">${vehicle.count}</div>
                <div style="color: #64748b; font-size: 0.875rem;">Total</div>
              </div>
              <div>
                <div style="font-size: 1.5rem; font-weight: 600; color: #059669;">${vehicle.in}</div>
                <div style="color: #64748b; font-size: 0.875rem;">In</div>
              </div>
              <div>
                <div style="font-size: 1.5rem; font-weight: 600; color: #dc2626;">${vehicle.out}</div>
                <div style="color: #64748b; font-size: 0.875rem;">Out</div>
              </div>
            </div>
          </div>
        `).join('');

      case 'detailed':
        return selectedData.map(vehicle => `
          <div style="
            margin-bottom: 1.5rem;
            padding: 2rem;
            background: ${selectedColor === '#ffffff' ? '#f9fafb' : '#ffffff'};
            border-radius: 16px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
              <h3 style="margin: 0; font-size: 1.4rem; color: #1e293b;">${vehicle.vehicleType}</h3>
              <div style="color: #64748b; font-size: 0.875rem;">Updated: ${vehicle.lastUpdated}</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
              <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 12px;">
                <div style="font-size: 1.2rem; font-weight: 600; color: #1e293b;">Morning</div>
                <div style="color: #059669;">In: ${vehicle.details.morning.in}</div>
                <div style="color: #dc2626;">Out: ${vehicle.details.morning.out}</div>
              </div>
              <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 12px;">
                <div style="font-size: 1.2rem; font-weight: 600; color: #1e293b;">Afternoon</div>
                <div style="color: #059669;">In: ${vehicle.details.afternoon.in}</div>
                <div style="color: #dc2626;">Out: ${vehicle.details.afternoon.out}</div>
              </div>
              <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 12px;">
                <div style="font-size: 1.2rem; font-weight: 600; color: #1e293b;">Evening</div>
                <div style="color: #059669;">In: ${vehicle.details.evening.in}</div>
                <div style="color: #dc2626;">Out: ${vehicle.details.evening.out}</div>
              </div>
              <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 12px;">
                <div style="font-size: 1.2rem; font-weight: 600; color: #1e293b;">Night</div>
                <div style="color: #059669;">In: ${vehicle.details.night.in}</div>
                <div style="color: #dc2626;">Out: ${vehicle.details.night.out}</div>
              </div>
            </div>
          </div>
        `).join('');

      case 'compact':
        return selectedData.map(vehicle => `
          <div style="
            margin-bottom: 1rem;
            padding: 1rem;
            background: ${selectedColor === '#ffffff' ? '#f9fafb' : '#ffffff'};
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 1rem; color: #64748b;">${vehicle.vehicleType}</div>
              <div style="font-size: 1.25rem; font-weight: 600; color: #4f46e5;">${vehicle.count}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.875rem;">
              <div style="color: #059669;">In: ${vehicle.in}</div>
              <div style="color: #dc2626;">Out: ${vehicle.out}</div>
            </div>
          </div>
        `).join('');

      case 'modern':
        return selectedData.map(vehicle => `
          <div style="
            margin-bottom: 1.5rem;
            padding: 2rem;
            background: linear-gradient(145deg, ${selectedColor}, white);
            border-radius: 20px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
              <h3 style="margin: 0; font-size: 1.5rem; color: #1e293b;">${vehicle.vehicleType}</h3>
              <div style="padding: 0.5rem 1rem; background: rgba(79, 70, 229, 0.1); border-radius: 20px; color: #4f46e5; font-weight: 600;">
                ${vehicle.count} Total
              </div>
            </div>
            <div style="display: flex; justify-content: space-around; gap: 1rem;">
              <div style="text-align: center; padding: 1.5rem; background: rgba(5, 150, 105, 0.1); border-radius: 16px; flex: 1;">
                <div style="font-size: 2rem; font-weight: 600; color: #059669;">${vehicle.in}</div>
                <div style="color: #059669;">Vehicles In</div>
              </div>
              <div style="text-align: center; padding: 1.5rem; background: rgba(220, 38, 38, 0.1); border-radius: 16px; flex: 1;">
                <div style="font-size: 2rem; font-weight: 600; color: #dc2626;">${vehicle.out}</div>
                <div style="color: #dc2626;">Vehicles Out</div>
              </div>
            </div>
          </div>
        `).join('');

      case 'minimal':
        return selectedData.map(vehicle => `
          <div style="
            margin-bottom: 2rem;
            padding: 2rem;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
          ">
            <div style="font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem;">${vehicle.vehicleType}</div>
            <div style="font-size: 2.5rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem;">${vehicle.count}</div>
            <div style="display: flex; gap: 2rem; color: #64748b; font-size: 0.875rem;">
              <div>In <span style="color: #059669; font-weight: 600;">${vehicle.in}</span></div>
              <div>Out <span style="color: #dc2626; font-weight: 600;">${vehicle.out}</span></div>
            </div>
          </div>
        `).join('');

      default:
        return '';
    }
  };

  const handleCreateKPI = () => {
    const kpiContent = `
      <div style="
        width: 100%;
        height: 100%;
        padding: 1rem;
        background-color: ${selectedColor};
        overflow-y: auto;
      ">
        ${getKPIContent(selectedKPIType)}
      </div>
    `;

    const newWidget = {
      type: 'kpi' as const,
      title: kpiTitle || 'Vehicle Statistics',
      content: kpiContent,
      backgroundColor: selectedColor
    };

    addWidget(newWidget);
    onClose();
    onKPICreated?.();
  };

  if (!isOpen) return null;

  return (
    <div className="kpi-modal-overlay">
      <div className="kpi-modal">
        <div className="kpi-modal-header">
          <h2>Create KPI Card</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="kpi-modal-content">
          <input
            type="text"
            value={kpiTitle}
            onChange={(e) => setKpiTitle(e.target.value)}
            placeholder="Enter KPI title"
            className="kpi-title-input"
          />

          <div className="kpi-type-section">
            <h3>Select KPI Type</h3>
            <div className="kpi-types-grid">
              {kpiTypes.map((type) => (
                <div
                  key={type.type}
                  className={`kpi-type-option ${selectedKPIType === type.type ? 'selected' : ''}`}
                  onClick={() => setSelectedKPIType(type.type)}
                >
                  <div className="kpi-type-icon">{type.icon}</div>
                  <div className="kpi-type-info">
                    <span className="kpi-type-label">{type.label}</span>
                    <span className="kpi-type-description">{type.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="color-selection-section">
            <h3>Background Color</h3>
            <div className="color-options">
              {pastelColors.map((color) => (
                <button
                  key={color.value}
                  className={`color-button ${selectedColor === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="kpi-preview">
            <h3>Preview</h3>
            <div 
              className="kpi-preview-container"
              style={{ 
                maxWidth: '600px',
                margin: '0 auto',
                transform: 'scale(0.8)',
                transformOrigin: 'top center'
              }}
              dangerouslySetInnerHTML={{ __html: `
                <div style="
                  width: 100%;
                  height: 100%;
                  padding: 1rem;
                  background-color: ${selectedColor};
                  overflow-y: auto;
                ">
                  ${getKPIContent(selectedKPIType)}
                </div>
              `}}
            />
          </div>
        </div>

        <div className="kpi-modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="create-button"
            onClick={handleCreateKPI}
            disabled={!kpiTitle.trim()}
          >
            Create KPI
          </button>
        </div>
      </div>
    </div>
  );
};

export default KPIModal; 