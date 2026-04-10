import React, { useState } from 'react';
import { Box, Typography, Chip, Button, Paper, CardContent } from '@mui/material';
import {
  WaterDrop as IrrigationIcon,
  Science as FertilizerIcon,
  Warning as WarningIcon,
  Agriculture as HarvestIcon,
  BugReport as PesticideIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { Recommendation } from '../../types';
import { colors } from '../../utils/theme';

const iconMap = {
  irrigation: IrrigationIcon,
  fertilizer: FertilizerIcon,
  warning: WarningIcon,
  harvest: HarvestIcon,
  pesticide: PesticideIcon,
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return colors.neutral[800];
    case 'high': return colors.neutral[700];
    case 'medium': return colors.neutral[600];
    case 'low': return colors.neutral[500];
    default: return colors.neutral[500];
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

  return (
    <Box sx={{ mb: 1.5 }}>
      <Paper elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: colors.neutral[200], backgroundColor: acknowledged ? colors.neutral[50] : 'white' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1, backgroundColor: colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon sx={{ fontSize: 20, color: colors.neutral[600] }} />
            </Box>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 200 }}>{recommendation.title}</Typography>
                  <Chip label={recommendation.priority} size="small" sx={{ height: 20, fontSize: '0.75rem', lineHeight: 1.5, backgroundColor: `${getPriorityColor(recommendation.priority)}20`, color: getPriorityColor(recommendation.priority) }} />
                  {recommendation.actionRequired && !acknowledged && <Chip label="Action" size="small" color="error" sx={{ height: 20, fontSize: '0.75rem', lineHeight: 1.5, borderRadius: 2 }} />}
                </Box>
                <Typography variant="caption" color="text.secondary">{getTimeAgo(recommendation.timestamp)}</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem', lineHeight: 1.4 }}>{recommendation.description}</Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {!acknowledged && recommendation.actionRequired && (
                    <Button variant="contained" size="small" onClick={() => setAcknowledged(true)} sx={{ textTransform: 'none', fontSize: '0.875rem', lineHeight: 1.5, borderRadius: 2 }}>
                      Acknowledge
                    </Button>
                  )}
                  <Button variant="outlined" size="small" sx={{ textTransform: 'none', fontSize: '0.8rem', borderRadius: 2 }}>Details</Button>
                </Box>

                {recommendation.probeId && <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>{recommendation.probeId}</Typography>}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Paper>
    </Box>
  );
};

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ recommendations }) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'action-required'>('all');

  const filteredRecommendations = recommendations.filter((recommendation) => {
    if (filter === 'critical') return recommendation.priority === 'critical';
    if (filter === 'action-required') return recommendation.actionRequired;
    return true;
  });

  const actionRequiredCount = recommendations.filter((recommendation) => recommendation.actionRequired).length;
  const criticalCount = recommendations.filter((recommendation) => recommendation.priority === 'critical').length;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid', borderColor: colors.neutral[200], gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ fontWeight: 200 }}>Recommendations ({filteredRecommendations.length})</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="All" size="small" variant={filter === 'all' ? 'filled' : 'outlined'} onClick={() => setFilter('all')} clickable sx={{ backgroundColor: filter === 'all' ? colors.neutral[200] : 'transparent', borderRadius: 2 }} />
          <Chip label={`Actions (${actionRequiredCount})`} size="small" variant={filter === 'action-required' ? 'filled' : 'outlined'} onClick={() => setFilter(filter === 'action-required' ? 'all' : 'action-required')} clickable sx={{ backgroundColor: filter === 'action-required' ? colors.neutral[200] : 'transparent', borderRadius: 2 }} />
          <Chip label={`Critical (${criticalCount})`} size="small" variant={filter === 'critical' ? 'filled' : 'outlined'} onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')} clickable sx={{ backgroundColor: filter === 'critical' ? colors.neutral[200] : 'transparent', borderRadius: 2 }} />
        </Box>
      </Box>

      {filteredRecommendations.length > 0 ? (
        <Box>{filteredRecommendations.map((recommendation) => <RecommendationItem key={recommendation.id} recommendation={recommendation} />)}</Box>
      ) : (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 1, backgroundColor: colors.neutral[25], border: '1px solid', borderColor: colors.neutral[200] }}>
          <CheckIcon sx={{ fontSize: 64, color: colors.neutral[500], mb: 2, opacity: 0.7 }} />
          <Typography variant="h6" sx={{ fontWeight: 200, mb: 1 }}>No live recommendations yet</Typography>
          <Typography variant="body2" color="text.secondary">Recommendations will appear here once the live probe readings produce an actionable condition.</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default RecommendationsPanel;