import React from 'react';
import {
  Card,
  Typography,
  Box,
  LinearProgress,
  alpha,
} from '@mui/material';
import {
  WaterDrop as MoistureIcon,
  Thermostat as TemperatureIcon,
  Opacity as HumidityIcon,
  Science as NPKIcon,
  Tune as PHIcon,
  LocalDrink as WaterTankIcon,
  SignalWifi4Bar as ConnectivityIcon,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';
import { DashboardCard } from '../../types';
import { colors } from '../../utils/theme';

const iconMap = {
  moisture: MoistureIcon,
  temperature: TemperatureIcon,
  humidity: HumidityIcon,
  npk: NPKIcon,
  ph: PHIcon,
  water_tank: WaterTankIcon,
  connectivity: ConnectivityIcon,
};

interface SummaryCardProps {
  data: DashboardCard;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ data }) => {
  const Icon = iconMap[data.icon as keyof typeof iconMap];

  const getTrendConfig = (trend: string) => {
    switch (trend) {
      case 'up': 
        return {
          color: colors.status.success,
          icon: TrendingUp,
          bgColor: alpha(colors.status.success, 0.1)
        };
      case 'down': 
        return {
          color: colors.status.error,
          icon: TrendingDown,
          bgColor: alpha(colors.status.error, 0.1)
        };
      case 'stable': 
        return {
          color: colors.neutral[600],
          icon: TrendingFlat,
          bgColor: alpha(colors.neutral[600], 0.1)
        };
      default: 
        return {
          color: colors.neutral[600],
          icon: TrendingFlat,
          bgColor: alpha(colors.neutral[600], 0.1)
        };
    }
  };

  const trendConfig = data.change ? getTrendConfig(data.change.trend) : null;

  return (
    <div style={{ width: '100%', display: 'flex' }}>
      <Card 
        elevation={0}
        sx={{ 
          width: '100%',
          minHeight: { xs: 140, sm: 160 },
          borderRadius: 1,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
          border: '1px solid',
          borderColor: alpha(colors.neutral[200], 0.8),
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${data.color}, ${alpha(data.color, 0.7)})`,
            borderRadius: '0 0 2px 2px',
          }
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(data.color, 0.1)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ 
          p: 3, 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Header with icon */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between',
            mb: 2
          }}>
            <Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: colors.neutral[600],
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  mb: 0.5
                }}
              >
                {data.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 500,
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    color: colors.neutral[700],
                    lineHeight: 1.2,
                  }}
                >
                  {data.value}
                </Typography>
                {data.unit && (
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: colors.neutral[500],
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      fontWeight: 600,
                      ml: 0.5
                    }}
                  >
                    {data.unit}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box
              className="icon-container"
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1,
                background: `linear-gradient(135deg, ${alpha(data.color, 0.1)} 0%, ${alpha(data.color, 0.05)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: alpha(data.color, 0.1),
              }}
            >
              <Icon sx={{ 
                fontSize: 26, 
                color: data.color
              }} />
            </Box>
          </Box>
          
          {/* Trend indicator */}
          {data.change && trendConfig && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mt: 'auto',
              pt: 1
            }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: trendConfig.bgColor,
                  border: '1px solid',
                  borderColor: alpha(trendConfig.color, 0.2),
                }}
              >
                <trendConfig.icon sx={{ 
                  fontSize: 14, 
                  color: trendConfig.color 
                }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 500,
                    color: trendConfig.color,
                    fontSize: '0.75rem',
                    lineHeight: 1.5
                  }}
                >
                  {Math.abs(data.change.value)}{data.unit || ''}
                </Typography>
              </Box>
              
              <Typography 
                variant="caption" 
                sx={{ 
                  color: colors.neutral[500],
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                vs {data.change.period}
              </Typography>
            </Box>
          )}

          {/* Water tank progress bar */}
          {data.id === 'water_tank' && typeof data.value === 'number' && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={data.value} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: alpha(colors.neutral[300], 0.3),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${
                      data.value < 30 ? colors.status.error : 
                      data.value < 60 ? colors.status.warning : 
                      colors.status.success
                    }, ${alpha(
                      data.value < 30 ? colors.status.error : 
                      data.value < 60 ? colors.status.warning : 
                      colors.status.success, 0.8
                    )})`,

                  },
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  mt: 1, 
                  display: 'block',
                  color: colors.neutral[600],
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                {data.value < 30 ? '🔴 Low - Refill needed' : 
                 data.value < 60 ? '🟡 Moderate level' : 
                 '🟢 Optimal level'}
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </div>
  );
};

interface SummaryCardsProps {
  cards: DashboardCard[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ cards }) => {
  if (cards.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: colors.neutral[200],
            borderRadius: 1,
            backgroundColor: colors.neutral[25],
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No live summary data available yet.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)',
        xl: 'repeat(6, 1fr)',
      },
      gap: { xs: 1, sm: 1.5, md: 2 },
      width: '100%',
      maxWidth: '100%',
      p: 0,
      m: 0,
    }}>
      {cards.map((card) => (
        <SummaryCard key={card.id} data={card} />
      ))}
    </Box>
  );
};

export default SummaryCards;