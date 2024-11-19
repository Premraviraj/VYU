import React, { useState } from 'react';
import { 
  Modal, 
  Button, 
  Box,
  Typography,
  CircularProgress,
  DialogTitle,
  DialogContent,
  DialogActions 
} from '@mui/material';
import { useGraphs } from '../../../context/GraphContext';
import type { Graph } from '../../../context/GraphContext';

interface FilterConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionName: string;
  onSave: (config: any) => Promise<void>;
  currentConfig: {
    timeOfDay: string;
    countType: string;
    rules: string;
    createWidget?: boolean;
  };
}

const FilterConfigModal: React.FC<FilterConfigModalProps> = ({
  isOpen,
  onClose,
  collectionName,
  onSave,
  currentConfig
}) => {
  const [config, setConfig] = useState(currentConfig);
  const [isLoading, setIsLoading] = useState(false);
  const { addGraph } = useGraphs();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(config);

      if (config.createWidget) {
        const graphId = `graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const widgetData: Graph = {
          id: graphId,
          type: config.countType === 'total' ? 'kpi' : 'graph',
          title: `${collectionName} - ${config.countType} Stats`,
          data: {
            type: config.countType,
            selectedData: []
          },
          backgroundColor: '#ffffff'
        };

        addGraph(graphId, widgetData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving filter config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="filter-config-modal"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
      }}>
        <DialogTitle>Filter Configuration</DialogTitle>
        <DialogContent>
          {/* Add your filter configuration fields here */}
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave} 
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogActions>
      </Box>
    </Modal>
  );
};

export default FilterConfigModal; 