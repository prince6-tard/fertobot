import React from 'react';
import { Box, Typography } from '@mui/material';
import { ProbeGroup, Probe } from '../../types';

interface GroupManagementProps {
  groups: ProbeGroup[];
  probes: Probe[];
  onGroupUpdate: (groups: ProbeGroup[]) => void;
  onProbeUpdate: (probes: Probe[]) => void;
}

const GroupManagement: React.FC<GroupManagementProps> = ({ 
  groups, 
  probes, 
  onGroupUpdate, 
  onProbeUpdate 
}) => {
  return (
    <Box>
      <Typography>Group Management - Coming Soon</Typography>
    </Box>
  );
};

export default GroupManagement;