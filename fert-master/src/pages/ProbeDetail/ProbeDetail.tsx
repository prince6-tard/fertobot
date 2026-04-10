import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

const ProbeDetail: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Probe Detail View
      </Typography>
      <Card>
        <CardContent>
          <Typography>
            Deep dive probe view with real-time readings and historical graphs - Coming Soon
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProbeDetail;