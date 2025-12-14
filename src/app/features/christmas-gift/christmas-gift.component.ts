import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

interface Milestone {
  id: number;
  name: string;
  percentage: number;
}

interface ChartPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-christmas-gift',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './christmas-gift.component.html',
  styleUrls: ['./christmas-gift.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChristmasGiftComponent {
  readonly totalGoal = 802.90;
  readonly currentAmount = signal(0); // This would come from donations
  readonly showModal = signal(false);
  readonly showHUD = signal(false);
  readonly imageError = signal(false);
  readonly hoveredContributorIndex = signal<number | null>(null);
  
  readonly paymentName = 'Marek Šípoš';
  readonly iban = 'LT303250033127984669';
  readonly bicSwift = 'REVOLUT21';
  readonly gpuImageUrl = 'https://www.gigabyte.com/FileUpload/Global/KeyFeature/3868/innergigabyte/images/features-img.png';

  readonly progressPercentage = computed(() => {
    return Math.min((this.currentAmount() / this.totalGoal) * 100, 100);
  });

  readonly daysUntilGoal = computed(() => {
    const today = new Date();
    const goalDate = new Date(2025, 11, 18); // December 18, 2025 (month is 0-indexed, so 11 = December)
    const diffTime = goalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays); // Don't show negative days
  });

  readonly goalVelocity = computed(() => {
    // Calculate average €/day based on current amount and days passed
    const daysPassed = this.chartData.days.length;
    if (daysPassed === 0) return 0;
    return (this.currentAmount() / daysPassed);
  });

  readonly completedMilestones = computed(() => {
    const progress = this.progressPercentage();
    return this.milestones.filter(m => progress >= m.percentage);
  });

  readonly currentMilestone = computed(() => {
    const progress = this.progressPercentage();
    const next = this.milestones.find(m => progress < m.percentage);
    return next || this.milestones[this.milestones.length - 1];
  });

  readonly lastAchievedMilestone = computed(() => {
    const progress = this.progressPercentage();
    const achieved = this.milestones.filter(m => progress >= m.percentage);
    return achieved.length > 0 ? achieved[achieved.length - 1] : null;
  });

  readonly milestones: Milestone[] = [
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

  // Enhanced chart data for dashboard-style visuals
  readonly chartData = {
    // Daily donations for bar chart - 3 days only
    dailyDonations: [120, 85, 150],
    days: ['Day 1', 'Day 2', 'Day 3'],
    
    // Growth trend for line chart
    growthTrend: [15, 18, 16, 22, 19, 25, 23, 28, 26, 31],
    
    // Overall stats
    growth: 23.5,
    totalDonors: 127,
    totalRaised: 124,
  };

  readonly contributors = [
    { name: 'Alex', amount: 50, date: '2024-12-20', color: '#f29f67' },
    { name: 'Sarah', amount: 75, date: '2024-12-21', color: '#8833cc' },
    { name: 'Mike', amount: 30, date: '2024-12-21', color: '#3b82f6' },
    { name: 'Anonymous', amount: 25, date: '2024-12-22', color: '#10b981' },
    { name: 'Unknown', amount: 120, date: '2024-12-22', color: '#6b7280' },
  ];

  readonly maxContributorAmount = computed(() => {
    return Math.max(...this.contributors.map(c => c.amount), 1);
  });

  readonly totalContributors = computed(() => {
    return this.contributors.length;
  });

  readonly contributorsTotal = computed(() => {
    return this.contributors.reduce((sum, c) => sum + c.amount, 0);
  });

  getContributorBarWidth(amount: number): number {
    return (amount / this.maxContributorAmount()) * 100;
  }

  // Pie chart calculations
  getPieDashArray(index: number): string {
    const total = this.contributorsTotal();
    const circumference = 2 * Math.PI * 40; // radius = 40
    const percentage = this.contributors[index].amount / total;
    const segmentLength = percentage * circumference;
    return `${segmentLength} ${circumference}`;
  }

  getPieDashOffset(index: number): number {
    const total = this.contributorsTotal();
    const circumference = 2 * Math.PI * 40; // radius = 40
    
    // Calculate cumulative offset from all previous segments
    let cumulativeOffset = 0;
    for (let i = 0; i < index; i++) {
      const prevPercentage = this.contributors[i].amount / total;
      cumulativeOffset += prevPercentage * circumference;
    }
    
    return cumulativeOffset;
  }

  getPiePercentage(index: number): number {
    const total = this.contributorsTotal();
    return (this.contributors[index].amount / total) * 100;
  }

  readonly maxDonation = computed(() => {
    return Math.max(...this.chartData.dailyDonations, 1);
  });

  readonly maxGrowth = computed(() => {
    return Math.max(...this.chartData.growthTrend, 1);
  });

  getBarWidth(value: number): number {
    return (value / this.maxDonation()) * 100;
  }

  getBarColor(value: number): string {
    // Simple color based on value - no gradient
    const percentage = (value / this.maxDonation()) * 100;
    
    if (percentage < 30) {
      // Small values: purple
      return '#8833cc';
    } else if (percentage < 60) {
      // Medium values: mix of purple and orange
      return '#a855f7';
    } else {
      // Large values: orange
      return '#f29f67';
    }
  }

  readonly circleCircumference = 2 * Math.PI * 45;

  getCircleOffset(): number {
    return this.circleCircumference * (1 - this.progressPercentage() / 100);
  }

  // Line chart path generation
  readonly lineChartPoints = computed(() => {
    const width = 300;
    const height = 80;
    const padding = 10;
    const maxValue = this.maxGrowth();
    const stepX = (width - padding * 2) / (this.chartData.growthTrend.length - 1);
    
    return this.chartData.growthTrend.map((value, index) => {
      const x = padding + (index * stepX);
      const normalizedValue = value / maxValue;
      const y = height - padding - (normalizedValue * (height - padding * 2));
      return { x, y };
    });
  });

  getLineChartPath(): string {
    const points = this.lineChartPoints();
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  }

  getAreaPath(): string {
    const points = this.lineChartPoints();
    if (points.length === 0) return '';
    
    const width = 300;
    const height = 80;
    const padding = 10;
    
    let path = `M ${points[0].x} ${height - padding}`;
    path += ` L ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    const lastPoint = points[points.length - 1];
    path += ` L ${lastPoint.x} ${height - padding} Z`;
    return path;
  }

  readonly gpuSpecs = {
    architecture: 'Blackwell GB203',
    vram: '16GB GDDR7 (Samsung)',
    bus: '256-bit',
    bandwidth: '896 GB/s',
    tgp: '300W',
  };

  readonly upgradeFeatures = {
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

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onImageHover(hovering: boolean): void {
    this.showHUD.set(hovering);
  }

  onContributorHover(index: number | null): void {
    this.hoveredContributorIndex.set(index);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  }

  formatIBAN(iban: string): string {
    // Format IBAN with spaces every 4 characters
    return iban.replace(/(.{4})/g, '$1 ').trim();
  }

  onImageError(): void {
    this.imageError.set(true);
  }
}