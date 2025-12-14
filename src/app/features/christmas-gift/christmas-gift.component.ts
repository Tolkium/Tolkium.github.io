import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TOTAL_GOAL,
  GOAL_DATE,
  MILESTONES,
  CONTRIBUTORS,
  PAYMENT_INFO,
  GPU_SPECS,
  UPGRADE_FEATURES,
  GPU_IMAGE_URL,
  calculateChartDataFromContributors,
  type Milestone,
  type Contributor,
  type ChartData,
  type GpuSpecs,
  type UpgradeFeatures,
  type PaymentInfo,
} from '../../models/christmas-gift.model';

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
  readonly totalGoal = TOTAL_GOAL;
  readonly currentAmount = signal(190); // Real donations: 20€ (12.12) + 100€ (13.12) + 50€ + 20€ = 190€
  readonly showModal = signal(false);
  readonly showHUD = signal(false);
  readonly imageError = signal(false);
  readonly hoveredContributorIndex = signal<number | null>(null);
  readonly tooltipPosition = signal<{ x: number; y: number; placement: 'top' | 'bottom' } | null>(null);
  
  readonly paymentInfo: PaymentInfo = PAYMENT_INFO;
  readonly gpuImageUrl = GPU_IMAGE_URL;

  readonly progressPercentage = computed(() => {
    return Math.min((this.currentAmount() / this.totalGoal) * 100, 100);
  });

  readonly daysUntilGoal = computed(() => {
    const today = new Date();
    const diffTime = GOAL_DATE.getTime() - today.getTime();
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

  readonly milestones: Milestone[] = MILESTONES;
  readonly contributors: Contributor[] = CONTRIBUTORS;
  readonly chartData: ChartData = calculateChartDataFromContributors(CONTRIBUTORS);

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

  // Pie chart calculations - rewritten from scratch
  private readonly pieRadius = 40;
  private readonly pieCircumference = 2 * Math.PI * 40;

  getPiePath(index: number): string {
    const total = this.contributorsTotal();
    if (total === 0) return '';

    // Calculate start and end angles for this segment
    let startAngle = -90; // Start from top (-90 degrees)
    
    // Calculate cumulative angle for all previous segments
    for (let i = 0; i < index; i++) {
      const prevPercentage = this.contributors[i].amount / total;
      startAngle += prevPercentage * 360;
    }
    
    // Calculate end angle for this segment
    const percentage = this.contributors[index].amount / total;
    const endAngle = startAngle + (percentage * 360);
    
    // For the last segment, ensure it closes exactly at 270 degrees (full circle)
    const finalEndAngle = index === this.contributors.length - 1 ? 270 : endAngle;
    
    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (finalEndAngle * Math.PI) / 180;
    
    // Calculate start and end points
    const x1 = 50 + this.pieRadius * Math.cos(startRad);
    const y1 = 50 + this.pieRadius * Math.sin(startRad);
    const x2 = 50 + this.pieRadius * Math.cos(endRad);
    const y2 = 50 + this.pieRadius * Math.sin(endRad);
    
    // Large arc flag (1 if angle > 180 degrees)
    const largeArcFlag = percentage > 0.5 ? 1 : 0;
    
    // Create SVG path for pie segment
    return `M 50 50 L ${x1} ${y1} A ${this.pieRadius} ${this.pieRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  }

  getPiePercentage(index: number): number {
    const total = this.contributorsTotal();
    if (total === 0) return 0;
    return Number(((this.contributors[index].amount / total) * 100).toFixed(2));
  }

  readonly maxDonation = computed(() => {
    return Math.max(...this.chartData.dailyDonations, 1);
  });

  readonly maxGrowth = computed(() => {
    return Math.max(...this.chartData.growthTrend, 1);
  });

  readonly maxDonationRate = computed(() => {
    return Math.max(...this.chartData.donationRateTrend, 1);
  });

  readonly maxVelocity = computed(() => {
    const values = this.chartData.velocityTrend;
    if (values.length === 0) return 1;
    const maxAbs = Math.max(...values.map(v => Math.abs(v)));
    return Math.max(maxAbs, 1);
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

  // Line chart path generation for velocity trend
  readonly lineChartPoints = computed(() => {
    const width = 300;
    const height = 80;
    const padding = 10;
    const maxValue = this.maxVelocity();
    const trendData = this.chartData.velocityTrend;
    if (trendData.length === 0) return [];
    
    const stepX = trendData.length > 1 ? (width - padding * 2) / (trendData.length - 1) : width / 2;
    const midY = height / 2; // Center line (zero point)
    
    return trendData.map((value, index) => {
      const x = padding + (index * stepX);
      // Normalize value: positive values go up, negative go down
      // Scale to fit in half the height (above and below center)
      const normalizedValue = maxValue > 0 ? value / maxValue : 0;
      const y = midY - (normalizedValue * (height / 2 - padding));
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
    
    const height = 80;
    const midY = height / 2; // Center line (zero point)
    
    let path = `M ${points[0].x} ${midY}`;
    path += ` L ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    const lastPoint = points[points.length - 1];
    path += ` L ${lastPoint.x} ${midY} Z`;
    return path;
  }

  readonly gpuSpecs: GpuSpecs = GPU_SPECS;
  readonly upgradeFeatures: UpgradeFeatures = UPGRADE_FEATURES;

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onImageHover(hovering: boolean): void {
    this.showHUD.set(hovering);
  }

  onContributorHover(index: number | null, event?: MouseEvent): void {
    this.hoveredContributorIndex.set(index);
    if (index !== null && event) {
      // Use requestAnimationFrame to ensure accurate positioning
      requestAnimationFrame(() => {
        // Calculate tooltip position with viewport bounds checking
        const tooltipWidth = 180; // Approximate tooltip width
        const tooltipHeight = 100; // Approximate tooltip height
        const padding = 15;
        
        let x = event.clientX + 15;
        let y = event.clientY - 10;
        let placement: 'top' | 'bottom' = 'top';
        
        // Check if tooltip would go off right edge
        if (x + tooltipWidth > window.innerWidth - padding) {
          x = event.clientX - tooltipWidth - 15;
        }
        
        // Check if tooltip would go off left edge
        if (x < padding) {
          x = padding;
        }
        
        // Check if tooltip would go off top edge (show below instead)
        if (y - tooltipHeight < padding) {
          y = event.clientY + 15;
          placement = 'bottom';
        }
        
        // Check if tooltip would go off bottom edge
        if (y + tooltipHeight > window.innerHeight - padding) {
          y = window.innerHeight - tooltipHeight - padding;
        }
        
        this.tooltipPosition.set({ x, y, placement });
      });
    } else {
      this.tooltipPosition.set(null);
    }
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