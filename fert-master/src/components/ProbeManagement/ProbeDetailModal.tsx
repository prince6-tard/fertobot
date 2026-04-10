import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Probe } from '../../types';

interface ProbeDetailModalProps {
  probe: Probe;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const ProbeDetailModal: React.FC<ProbeDetailModalProps> = ({ 
  probe, 
  open, 
  onClose, 
  onRefresh 
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">{probe.name} - Detailed View</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>Probe Detail Modal - Coming Soon</Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ProbeDetailModal;