import { useEffect, useState } from 'react';
import { API_URL } from '../../utils/config';
import './WidgetsPage.css';
// Import the same icons used in KPIModal
import {
  Dashboard, TrendingUp, Assessment, PieChart, BarChart,
  ShowChart, BubbleChart, DonutLarge, Insights, Analytics,
  Speed, Timer, AccessTime, CalendarToday, Event,
  Person, Group, Groups, Business, Store,
  LocalShipping, DirectionsCar, FlightTakeoff, Train,
  Security, Shield, Gavel, VerifiedUser,
  Notifications, Warning, Error as ErrorIcon, CheckCircle
} from '@mui/icons-material';

// Icon mapping object
const iconMap: { [key: string]: JSX.Element } = {
  'Dashboard': <Dashboard />,
  'Trending': <TrendingUp />,
  'Assessment': <Assessment />,
  'Analytics': <Analytics />,
  'Insights': <Insights />,
  'Pie Chart': <PieChart />,
  'Bar Chart': <BarChart />,
  'Line Chart': <ShowChart />,
  'Bubble Chart': <BubbleChart />,
  'Donut Chart': <DonutLarge />,
  'Speed': <Speed />,
  'Timer': <Timer />,
  'Clock': <AccessTime />,
  'Calendar': <CalendarToday />,
  'Event': <Event />,
  'Person': <Person />,
  'Group': <Group />,
  'Groups': <Groups />,
  'Business': <Business />,
  'Store': <Store />,
  'Shipping': <LocalShipping />,
  'Car': <DirectionsCar />,
  'Flight': <FlightTakeoff />,
  'Train': <Train />,
  'Security': <Security />,
  'Shield': <Shield />,
  'Rules': <Gavel />,
  'Verified': <VerifiedUser />,
  'Notification': <Notifications />,
  'Warning': <Warning />,
  'Error': <ErrorIcon />,
  'Success': <CheckCircle />
};

interface KPICard {
  kpi_id: string;
  kpi_name: string;
  design_type: string;
  fields: {
    field_id: string;
    field_name: string;
    field_value: number;
    collection_name: string;
    video_source: string;
    rule_name: string;
    styling: {
      color: string;
      size: string;
      icon?: string;
    };
  }[];
}

const WidgetsPage = () => {
  const [kpiCards, setKpiCards] = useState<KPICard[]>([]);
  const [realTimeValues, setRealTimeValues] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch KPI cards from database
  const fetchKPICards = async () => {
    try {
      setIsLoading(true);
      // First fetch collections
      const response = await fetch(`${API_URL}/api/v1/Collection/filtered?collection=kpiCards&database=VYU&type=kpi`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('KPI Cards response:', data);

      if (data && data.documents) {
        // Transform the documents into KPICard format
        const cards = data.documents.map((doc: any) => ({
          kpi_id: doc._id,
          kpi_name: doc.kpi_name || 'Untitled KPI',
          design_type: doc.design_type || 'modern',
          fields: doc.fields || []
        }));

        setKpiCards(cards);
      } else {
        setKpiCards([]);
      }
    } catch (error) {
      console.error('Error fetching KPI cards:', error);
      setKpiCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch real-time values for fields
  const fetchFieldData = async (field: KPICard['fields'][0]) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/Collection/filtered/count?collection=${field.collection_name}&VideoSource=${field.video_source}&Rule=${field.rule_name}`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Field data response:', data);
        
        if (data && data.fieldCounts && data.fieldCounts[field.rule_name] !== undefined) {
          setRealTimeValues(prev => ({
            ...prev,
            [field.field_id]: data.fieldCounts[field.rule_name]
          }));
        }
      }
    } catch (error) {
      console.error(`Error fetching data for field ${field.field_name}:`, error);
    }
  };

  // Initial fetch and setup interval for updates
  useEffect(() => {
    fetchKPICards();

    const intervalId = setInterval(() => {
      kpiCards.forEach(card => {
        card.fields.forEach(field => {
          fetchFieldData(field);
        });
      });
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []); // Only run on mount

  // Add another useEffect for field updates
  useEffect(() => {
    // Initial fetch of field data when kpiCards changes
    kpiCards.forEach(card => {
      card.fields.forEach(field => {
        fetchFieldData(field);
      });
    });
  }, [kpiCards]); // Run when kpiCards changes

  const renderKPICard = (card: KPICard) => (
    <div key={card.kpi_id} className={`kpi-preview-${card.design_type}`}>
      <div className="kpi-main-content">
        <div className="kpi-header">
          <h3 className="kpi-title">{card.kpi_name}</h3>
        </div>
      </div>

      <div className="kpi-fields-grid">
        {card.fields.map(field => (
          <div 
            key={field.field_id} 
            className={`kpi-field ${field.styling.size || 'medium'}`}
            style={{ color: field.styling.color }}
          >
            {field.styling.icon && (
              <div className="field-icon">
                {iconMap[field.styling.icon]}
              </div>
            )}
            <div className="field-value">
              {realTimeValues[field.field_id] !== undefined 
                ? realTimeValues[field.field_id] 
                : field.field_value}
            </div>
            <div className="field-label">{field.field_name}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="widgets-page">
      {isLoading ? (
        <div className="loading-state">Loading KPI Cards...</div>
      ) : kpiCards.length === 0 ? (
        <div className="empty-state">
          <h3>No KPI Cards Found</h3>
          <p>Create your first KPI card to see it here.</p>
        </div>
      ) : (
        <div className="kpi-cards-container">
          {kpiCards.map(renderKPICard)}
        </div>
      )}
    </div>
  );
};

export default WidgetsPage; 