import React, { useState } from 'react';
import { Box, Typography, Chip, Button, alpha } from '@mui/material';
import {
  WaterDrop as IrrigationIcon,
  Science as FertilizerIcon,
  Warning as WarningIcon,
  Agriculture as HarvestIcon,
  BugReport as PesticideIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { Recommendation } from '../../types';

const iconMap = {
  irrigation: IrrigationIcon,
  fertilizer: FertilizerIcon,
  warning: WarningIcon,
  harvest: HarvestIcon,
  pesticide: PesticideIcon,
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'critical': return { color: '#EF5350', label: 'Critical' };
    case 'high':     return { color: '#FFB74D', label: 'High' };
    case 'medium':   return { color: '#4FC3F7', label: 'Medium' };
    default:         return { color: '#52D080', label: 'Low' };
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'irrigation':  return '#4FC3F7';
    case 'fertilizer':  return '#CE93D8';
    case 'harvest':     return '#52D080';
    case 'pesticide':   return '#FFD54F';
    default:            return '#FFB74D';
  }
};

const getTimeAgo = (timestamp: Date) => {
  const diff = Date.now() - timestamp.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

interface RecommendationItemProps {
  recommendation: Recommendation;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({ recommendation }) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const Icon = iconMap[recommendation.icon as keyof typeof iconMap] || WarningIcon;
  const { color: priorityColor } = getPriorityConfig(recommendation.priority);
  const iconColor = getIconColor(recommendation.icon);

  if (acknowledged) return null;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: '12px',
        border: `1px solid ${alpha(priorityColor, 0.22)}`,
        borderLeft: `3px solid ${priorityColor}`,
        backgroundColor: alpha(priorityColor, 0.05),
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          right: -15, top: -15,
          width: 80, height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(priorityColor, 0.08)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
        {/* Icon */}
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '10px',
            backgroundColor: alpha(iconColor, 0.14),
            border: `1px solid ${alpha(iconColor, 0.28)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 17, color: iconColor }} />
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {/* Title row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#F0EDE6', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              {recommendation.title}
            </Typography>
            <Chip
              label={getPriorityConfig(recommendation.priority).label}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.58rem',
                backgroundColor: alpha(priorityColor, 0.15),
                color: priorityColor,
                border: `1px solid ${alpha(priorityColor, 0.3)}`,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
            <Typography sx={{ fontSize: '0.6rem', color: '#8FA89C', fontFamily: '"DM Mono", monospace', ml: 'auto' }}>
              {getTimeAgo(recommendation.timestamp)}
            </Typography>
          </Box>

          <Typography sx={{ fontSize: '0.73rem', color: '#8FA89C', mb: 1, lineHeight: 1.5 }}>
            {recommendation.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {recommendation.actionRequired && (
              <Button
                size="small"
                onClick={() => setAcknowledged(true)}
                sx={{
                  fontSize: '0.68rem', minHeight: 'unset', px: 1.25, py: 0.4,
                  backgroundColor: alpha(priorityColor, 0.15),
                  color: priorityColor,
                  border: `1px solid ${alpha(priorityColor, 0.3)}`,
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: alpha(priorityColor, 0.25) },
                }}
              >
                Acknowledge
              </Button>
            )}
            <Button
              size="small"
              sx={{ fontSize: '0.68rem', minHeight: 'unset', px: 1.25, py: 0.4, color: '#8FA89C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', '&:hover': { color: '#F0EDE6' } }}
            >
              Details
            </Button>
            {recommendation.probeId && (
              <Typography sx={{ fontSize: '0.6rem', color: alpha(priorityColor, 0.7), fontFamily: '"DM Mono", monospace', ml: 'auto' }}>
                {recommendation.probeId}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ recommendations }) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'action-required'>('all');

  const filteredRecommendations = recommendations.filter((r) => {
    if (filter === 'critical') return r.priority === 'critical';
    if (filter === 'action-required') return r.actionRequired;
    return true;
  });

  const actionRequiredCount = recommendations.filter((r) => r.actionRequired).length;
  const criticalCount = recommendations.filter((r) => r.priority === 'critical').length;

  const filterChipSx = (active: boolean) => ({
    height: 22,
    fontSize: '0.65rem',
    cursor: 'pointer',
    backgroundColor: active ? 'rgba(244,162,97,0.15)' : 'transparent',
    color: active ? '#F4A261' : '#8FA89C',
    border: `1px solid ${active ? 'rgba(244,162,97,0.3)' : 'rgba(255,255,255,0.1)'}`,
    '& .MuiChip-label': { px: 1 },
    '&:hover': { backgroundColor: 'rgba(244,162,97,0.1)', color: '#F4A261' },
  });

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, pb: 1, borderBottom: '1px solid rgba(255,255,255,0.07)', gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#F0EDE6', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          Recommendations
          <Box component="span" sx={{ ml: 1, px: 0.9, py: 0.2, borderRadius: '6px', fontSize: '0.7rem', backgroundColor: 'rgba(244,162,97,0.1)', color: '#F4A261', border: '1px solid rgba(244,162,97,0.2)', fontFamily: '"DM Mono", monospace' }}>
            {filteredRecommendations.length}
          </Box>
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Chip label="All" size="small" onClick={() => setFilter('all')} sx={filterChipSx(filter === 'all')} />
          <Chip label={`Actions ${actionRequiredCount}`} size="small" onClick={() => setFilter(filter === 'action-required' ? 'all' : 'action-required')} sx={filterChipSx(filter === 'action-required')} />
          <Chip label={`Critical ${criticalCount}`} size="small" onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')} sx={filterChipSx(filter === 'critical')} />
        </Box>
      </Box>

      {filteredRecommendations.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filteredRecommendations.map((r) => <RecommendationItem key={r.id} recommendation={r} />)}
        </Box>
      ) : (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: '12px',
            border: '1px solid rgba(82,208,128,0.15)',
            background: 'linear-gradient(135deg, #132B1A 0%, rgba(82,208,128,0.04) 100%)',
          }}
        >
          <CheckIcon sx={{ fontSize: 28, color: '#52D080', mb: 0.75, opacity: 0.8 }} />
          <Typography sx={{ fontSize: '0.8rem', color: '#8FA89C' }}>
            No recommendations — conditions look good
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RecommendationsPanel;
