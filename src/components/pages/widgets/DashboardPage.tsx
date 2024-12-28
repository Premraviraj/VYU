import React, { useEffect, useState } from 'react';
import { API_URL } from '../../../utils/config';
import { StorageRounded } from '@mui/icons-material';

interface PreparedField {
  field_id: string;
  field_name: string;
  fieldvalue: number;
  collection_name: string;
  video_source: string;
  rule_name: string;
  styling?: {
    color: string;
    size: string;
    icon?: string;
  };
}

interface PreparedKPICard {
  id: string;
  title: string;
  design: string;
  fields: PreparedField[];
}

interface FieldStyles {
  container: React.CSSProperties;
  value: React.CSSProperties;
  icon: React.CSSProperties;
  label: React.CSSProperties;
}

const getFieldStyles = (styling: PreparedField['styling']): FieldStyles => {
  const defaultColor = '#4f46e5';
  const defaultSize = 'medium';

  return {
    container: {
      color: styling?.color || defaultColor,
      padding: styling?.size === 'large' ? '1.5rem' : '1rem',
    },
    value: {
      fontSize: styling?.size === 'large' ? '2.5rem' : '2rem',
      color: styling?.color || defaultColor,
      fontWeight: 600,
    },
    icon: {
      width: styling?.size === 'large' ? '40px' : '32px',
      height: styling?.size === 'large' ? '40px' : '32px',
      color: styling?.color || defaultColor,
    },
    label: {
      fontSize: styling?.size === 'large' ? '1rem' : '0.875rem',
      color: `${styling?.color || defaultColor}99`,
      fontWeight: 500,
    }
  };
};

const iconMap: { [key: string]: JSX.Element } = {
  'Storage': <StorageRounded />,
  // Add other icons as needed
};

const BlankWindow: React.FC = () => {
  const [kpiCards, setKpiCards] = useState<PreparedKPICard[]>([]);

  const fetchFieldValues = async (cards: PreparedKPICard[]) => {
    try {
      const updatedCards = await Promise.all(cards.map(async (card) => {
        const updatedFields = await Promise.all(card.fields.map(async (field) => {
          try {
            const response = await fetch(
              `${API_URL}/api/v1/Collection/filtered/count?collection=${encodeURIComponent(field.collection_name)}&VideoSource=${encodeURIComponent(field.video_source)}&Rule=${encodeURIComponent(field.rule_name)}`,
              {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                credentials: 'include'
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data?.ruleCounts?.[field.rule_name] !== undefined) {
                return {
                  ...field,
                  fieldvalue: data.ruleCounts[field.rule_name]
                };
              }
            }
            return field;
          } catch (error) {
            console.error(`Error fetching value for field ${field.field_name}:`, error);
            return field;
          }
        }));

        return {
          ...card,
          fields: updatedFields
        };
      }));

      setKpiCards(updatedCards);
    } catch (error) {
      console.error('Error updating field values:', error);
    }
  };

  const renderField = (field: PreparedField) => {
    if (!field || !field.field_id) {
      console.error('Invalid field data:', field);
      return null;
    }

    const styles = getFieldStyles(field.styling || {
      color: '#4f46e5',
      size: 'medium'
    });
    
    return (
      <div 
        key={field.field_id} 
        className={`kpi-field ${field.styling?.size || 'medium'}`}
        style={styles.container}
      >
        {field.styling?.icon && iconMap[field.styling.icon] && (
          <div className="field-icon" style={styles.icon}>
            {iconMap[field.styling.icon]}
          </div>
        )}
        <div className="field-value" style={styles.value}>
          {field.fieldvalue.toLocaleString()}
        </div>
        <div className="field-label" style={styles.label}>
          {field.field_name}
        </div>
        <div className="field-source" style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Source: {field.video_source}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (kpiCards.length > 0) {
      const interval = setInterval(() => {
        fetchFieldValues(kpiCards);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [kpiCards]);

  return (
    <div>
      {kpiCards.map(card => (
        <div key={card.id}>
          {card.fields.map(field => renderField(field))}
        </div>
      ))}
    </div>
  );
};

export default BlankWindow; 