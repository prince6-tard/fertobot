import React from 'react';
import { Typography, Box, Card, CardContent } from '@mui/material';

const Reports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Reports & Analytics
      </Typography>
      <Card>
        <CardContent>
          <Typography>
            Comprehensive reporting interface with export functionality for PDF, CSV, XLS - Coming Soon
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;