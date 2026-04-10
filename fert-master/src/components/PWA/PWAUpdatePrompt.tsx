import React from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Box,
  Typography,
} from '@mui/material';
import {
  SystemUpdate as UpdateIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface PWAUpdatePromptProps {
  open: boolean;
  onUpdate: () => void;
  onClose: () => void;
}

const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({
  open,
  onUpdate,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          minWidth: '350px',
        },
      }}
    >
      <Alert
        severity="info"
        variant="filled"
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          backgroundColor: '#2196f3',
          color: 'white',
        }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<UpdateIcon />}
              onClick={onUpdate}
              sx={{
                backgroundColor: 'white',
                color: '#2196f3',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              Update Now
            </Button>
            <Button
              size="small"
              onClick={onClose}
              sx={{
                color: 'white',
                minWidth: 'auto',
                padding: '4px 8px',
              }}
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Box>
        }
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            App Update Available
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            A new version is ready. Update to get the latest features.
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default PWAUpdatePrompt;