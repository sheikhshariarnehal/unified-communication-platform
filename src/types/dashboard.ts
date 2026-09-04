export interface AutomationItem {
  id: string;
  name: string;
  progressPercent: number;
  stepsSummary: string;
  channel: 'email' | 'whatsapp' | 'unified';
  status: 'active' | 'paused';
}

export interface KpiMetric {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  type: 'arc' | 'bars' | 'range';
  subLabel?: string;
  dataPoints?: number[];
}

export interface ChartDataPoint {
  date: string;
  displayDate: string;
  revenue: number;
  clickRate: number;
  unsubscribes: number;
}

export interface DeliverabilityIndicator {
  label: string;
  status: string;
  color: 'emerald' | 'rose' | 'blue' | 'amber';
}

export interface ScheduledCampaign {
  id: string;
  name: string;
  channel: 'email' | 'whatsapp' | 'unified';
  timeRange: string;
  dateBadge: string;
  colorTheme: 'blue' | 'amber' | 'emerald';
  status: 'scheduled' | 'sending' | 'completed';
}
