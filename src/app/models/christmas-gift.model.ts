// Christmas Gift Page Models and Constants

export interface Milestone {
  id: number;
  name: string;
  percentage: number;
}

export interface Contributor {
  name: string;
  amount: number;
  date: string;
  color: string;
}

export interface ChartData {
  dailyDonations: number[];
  days: string[];
  growthTrend: number[];
  donationRateTrend: number[]; // Daily donation rate trend (€/day)
  velocityTrend: number[]; // Velocity trend: needed €/day vs actual (difference)
  growth: number;
  totalDonors: number;
  totalRaised: number;
}

export interface GpuSpecs {
  architecture: string;
  vram: string;
  bus: string;
  bandwidth: string;
  tgp: string;
}

export interface UpgradeFeature {
  label: string;
  desc: string;
}

export interface UpgradeFeatures {
  vs3080: {
    vram: { current: string; previous: string; improvement: string };
    bandwidth: { current: string; previous: string; improvement: string };
    dlss: { current: string; previous: string; improvement: string };
    architecture: { current: string; previous: string; improvement: string };
    tensorCores: { current: string; previous: string; improvement: string };
    rayTracing: { current: string; previous: string; improvement: string };
    performance: { current: string; previous: string; improvement: string };
    memorySpeed: { current: string; previous: string; improvement: string };
  };
  keyFeatures: UpgradeFeature[];
}

export interface PaymentInfo {
  name: string;
  iban: string;
  bicSwift: string;
}

// Constants
export const TOTAL_GOAL = 802.90;
export const GOAL_DATE = new Date(2025, 11, 18); // December 18, 2025

export const MILESTONES: Milestone[] = [
  { id: 1, name: 'Anti-Static Bag', percentage: 0 },
  { id: 2, name: 'Bare PCB', percentage: 6.67 },
  { id: 3, name: 'Power Delivery (VRMs)', percentage: 13.33 },
  { id: 4, name: 'Capacitors', percentage: 20.00 },
  { id: 5, name: 'PCIe 5.0 Interface', percentage: 26.67 },
  { id: 6, name: 'DisplayPort 2.1b Connectors', percentage: 33.33 },
  { id: 7, name: 'Rear I/O Bracket', percentage: 40.00 },
  { id: 8, name: 'Thermal Paste Application', percentage: 46.67 },
  { id: 9, name: 'VRAM Module 1', percentage: 53.33 },
  { id: 10, name: 'VRAM Module 2', percentage: 60.00 },
  { id: 11, name: 'VRAM Module 3', percentage: 66.67 },
  { id: 12, name: 'The Core: GB203-300-A1', percentage: 73.33 },
  { id: 13, name: 'Heatpipes & Heatsink', percentage: 80.00 },
  { id: 14, name: 'Windforce Fans', percentage: 86.67 },
  { id: 15, name: 'RGB Lighting & Soul', percentage: 100.00 },
];

export const CONTRIBUTORS: Contributor[] = [
  { name: 'Šimon', amount: 30, date: '2025-12-12', color: '#f29f67' },
  { name: 'Šimon', amount: 100, date: '2025-12-13', color: '#f29f67' },
  { name: 'Anonymous family member', amount: 50, date: '2025-12-14', color: '#8833cc' },
  { name: 'Anonymous family member', amount: 20, date: '2025-12-14', color: '#3b82f6' },
];

export const PAYMENT_INFO: PaymentInfo = {
  name: 'Marek Šípoš',
  iban: 'LT303250033127984669',
  bicSwift: 'REVOLUT21',
};

export const GPU_SPECS: GpuSpecs = {
  architecture: 'Blackwell GB203',
  vram: '16GB GDDR7 (Samsung)',
  bus: '256-bit',
  bandwidth: '896 GB/s',
  tgp: '300W',
};

export const UPGRADE_FEATURES: UpgradeFeatures = {
  vs3080: {
    vram: { current: '16GB GDDR7', previous: '10GB GDDR6X', improvement: '+60%' },
    bandwidth: { current: '896 GB/s', previous: '760 GB/s', improvement: '+18%' },
    dlss: { current: 'DLSS 4', previous: 'DLSS 2', improvement: '2x Gen' },
    architecture: { current: 'Blackwell', previous: 'Ampere', improvement: '2 Gen' },
    tensorCores: { current: '5th Gen', previous: '3rd Gen', improvement: '+67%' },
    rayTracing: { current: '4th Gen', previous: '2nd Gen', improvement: '2x Gen' },
    performance: { current: '~2.5x', previous: 'Baseline', improvement: 'RTX 3080' },
    memorySpeed: { current: '28 Gbps', previous: '19 Gbps', improvement: '+47%' },
  },
  keyFeatures: [
    { label: 'DLSS 4', desc: 'Multi Frame Generation' },
    { label: 'WINDFORCE', desc: 'Server-grade thermal gel' },
    { label: 'SFF-Ready', desc: 'Compact form factor' },
    { label: 'Hawk Fan', desc: '+53.6% air pressure' },
    { label: 'Dual BIOS', desc: 'Performance/Silent' },
    { label: '4th Gen RT', desc: 'Mega Geometry' },
  ]
};

export const GPU_IMAGE_URL = 'https://www.gigabyte.com/FileUpload/Global/KeyFeature/3868/innergigabyte/images/features-img.png';

// Helper function to calculate chart data from contributors
export function calculateChartDataFromContributors(contributors: Contributor[]): ChartData {
  // Group donations by date
  const donationsByDate = new Map<string, number>();
  
  contributors.forEach(contributor => {
    const date = contributor.date;
    const existing = donationsByDate.get(date) || 0;
    donationsByDate.set(date, existing + contributor.amount);
  });

  // Sort dates and create arrays
  const sortedDates = Array.from(donationsByDate.keys()).sort();
  const dailyDonations = sortedDates.map(date => donationsByDate.get(date)!);
  const days = sortedDates.map(date => {
    const d = new Date(date);
    return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Calculate growth trend (simplified - showing progress over time)
  const totalRaised = contributors.reduce((sum, c) => sum + c.amount, 0);
  const growthTrend = sortedDates.map((_, index) => {
    const cumulative = dailyDonations.slice(0, index + 1).reduce((sum, val) => sum + val, 0);
    return Math.round((cumulative / TOTAL_GOAL) * 100);
  });

  // Calculate daily donation rate trend (€/day average up to that point)
  const donationRateTrend = sortedDates.map((_, index) => {
    const daysCount = index + 1;
    const cumulative = dailyDonations.slice(0, index + 1).reduce((sum, val) => sum + val, 0);
    return daysCount > 0 ? Number((cumulative / daysCount).toFixed(1)) : 0;
  });

  // Calculate velocity trend: needed €/day vs actual €/day
  const today = new Date();
  const goalDate = GOAL_DATE;
  const velocityTrend = sortedDates.map((dateStr, index) => {
    const cumulative = dailyDonations.slice(0, index + 1).reduce((sum, val) => sum + val, 0);
    const daysPassed = index + 1;
    const currentDate = new Date(dateStr);
    const daysRemaining = Math.max(1, Math.ceil((goalDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    const remaining = TOTAL_GOAL - cumulative;
    const neededVelocity = remaining / daysRemaining;
    const actualVelocity = daysPassed > 0 ? cumulative / daysPassed : 0;
    
    // Return the difference: positive means ahead, negative means behind
    return Number((actualVelocity - neededVelocity).toFixed(1));
  });

  return {
    dailyDonations,
    days,
    growthTrend,
    donationRateTrend,
    velocityTrend,
    growth: totalRaised > 0 ? Number(((totalRaised / TOTAL_GOAL) * 100).toFixed(2)) : 0,
    totalDonors: contributors.length,
    totalRaised,
  };
}

