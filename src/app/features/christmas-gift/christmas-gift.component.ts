import { Component, ChangeDetectionStrategy, signal, computed, DestroyRef, inject } from '@angular/core';
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
import {
  type Language,
  type GiftTranslations,
  TRANSLATIONS
} from './translations/gift-translations';

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
  private readonly destroyRef = inject(DestroyRef);
  readonly totalGoal = TOTAL_GOAL;
  readonly showModal = signal(false);
  readonly showHUD = signal(false);
  readonly imageError = signal(false);
  readonly hoveredContributorIndex = signal<number | null>(null);
  readonly tooltipPosition = signal<{ x: number; y: number; placement: 'top' | 'bottom' } | null>(null);
  readonly chartVariant = signal<'glow' | 'rough'>('glow'); // Toggle between glow center and rough circle

  // Translation system - auto-detect browser language
  readonly currentLanguage = signal<Language>(this.detectBrowserLanguage());
  readonly t = computed<GiftTranslations>(() => TRANSLATIONS[this.currentLanguage()]);

  private detectBrowserLanguage(): Language {
    const browserLang = navigator?.language || navigator?.languages?.[0] || 'en';
    return browserLang.toLowerCase().startsWith('sk') ? 'sk' : 'en';
  }

  toggleLanguage(): void {
    this.currentLanguage.update(lang => lang === 'en' ? 'sk' : 'en');
  }

  /**
   * Text rotation system - 6 alternative gift messages
   * These messages rotate every 5 seconds with Elastic Stretch animation
   * Now uses translations based on current language
   */
  readonly textAlternatives = computed(() => this.t().textAlternatives);

  private readonly TEXT_COUNT = 6; // Number of text alternatives

  /**
   * Single variant (variant 8: Elastic Stretch animation)
   * textIndex: Current index in the textAlternatives array
   * textKey: Key used to force animation restart on text change
   */
  readonly textIndex = signal(8 % this.TEXT_COUNT);
  readonly textKey = signal(0); // Key to force re-render and animation restart
  private textRotationInterval: ReturnType<typeof setInterval> | null = null;

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

  // Calculate current amount from contributors (always in sync with data)
  readonly currentAmount = computed(() => {
    return this.contributorsTotal();
  });

  // Calculate amount and percentage contributed by "Šimon" (me)
  readonly myContributionAmount = computed(() => {
    return this.contributors
      .filter(c => c.name === 'Šimon')
      .reduce((sum, c) => sum + c.amount, 0);
  });

  readonly myContributionPercentage = computed(() => {
    return (this.myContributionAmount() / this.totalGoal) * 100;
  });

  // Calculate amount and percentage contributed by others
  readonly othersContributionAmount = computed(() => {
    return this.contributors
      .filter(c => c.name !== 'Šimon')
      .reduce((sum, c) => sum + c.amount, 0);
  });

  readonly othersContributionPercentage = computed(() => {
    return (this.othersContributionAmount() / this.totalGoal) * 100;
  });

  // Find top contributor by summing all contributions per person (excluding Šimon)
  readonly topContributor = computed(() => {
    const grouped = this.groupedContributors().filter(c => c.name !== 'Šimon');
    let topName = '';
    let topAmount = 0;
    
    grouped.forEach(c => {
      if (c.amount > topAmount) {
        topAmount = c.amount;
        topName = c.name;
      }
    });
    
    return { name: topName, amount: topAmount };
  });

  // Count of unique contributors to thank (excluding Šimon)
  readonly thankYouCount = computed(() => {
    return this.groupedContributors().filter(c => c.name !== 'Šimon').length;
  });

  // Group contributors by name, summing their amounts
  readonly groupedContributors = computed(() => {
    const groups = new Map<string, { name: string; amount: number; color: string }>();
    
    this.contributors.forEach(c => {
      const existing = groups.get(c.name);
      if (existing) {
        existing.amount += c.amount;
      } else {
        groups.set(c.name, { name: c.name, amount: c.amount, color: c.color });
      }
    });
    
    return Array.from(groups.values());
  });

  readonly uniqueContributorsCount = computed(() => {
    return this.groupedContributors().length;
  });

  getContributorBarWidth(amount: number): number {
    return (amount / this.maxContributorAmount()) * 100;
  }

  // Pie chart calculations - rewritten from scratch
  private readonly pieRadius = 40;
  private readonly pieCircumference = 2 * Math.PI * 40;
  private readonly innerRadius = 25; // For donut chart (rough circle variant)
  private readonly roughness = 2; // Amount of roughness for irregular border

  getPiePath(index: number): string {
    const grouped = this.groupedContributors();
    const total = this.contributorsTotal();
    if (total === 0) return '';

    // Calculate start and end angles for this segment
    let startAngle = -90; // Start from top (-90 degrees)

    // Calculate cumulative angle for all previous segments
    for (let i = 0; i < index; i++) {
      const prevPercentage = grouped[i].amount / total;
      startAngle += prevPercentage * 360;
    }

    // Calculate end angle for this segment
    const percentage = grouped[index].amount / total;
    const endAngle = startAngle + (percentage * 360);

    // For the last segment, ensure it closes exactly at 270 degrees (full circle)
    const finalEndAngle = index === grouped.length - 1 ? 270 : endAngle;

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

  // Get rough circle path for donut chart variant
  getRoughCirclePath(index: number): string {
    const grouped = this.groupedContributors();
    const total = this.contributorsTotal();
    if (total === 0) return '';

    // Calculate start and end angles for this segment
    let startAngle = -90; // Start from top (-90 degrees)

    // Calculate cumulative angle for all previous segments
    for (let i = 0; i < index; i++) {
      const prevPercentage = grouped[i].amount / total;
      startAngle += prevPercentage * 360;
    }

    // Calculate end angle for this segment
    const percentage = grouped[index].amount / total;
    const endAngle = startAngle + (percentage * 360);

    // For the last segment, ensure it closes exactly at 270 degrees (full circle)
    const finalEndAngle = index === grouped.length - 1 ? 270 : endAngle;

    // Generate rough outer arc
    const outerPath = this.generateRoughArc(50, 50, this.pieRadius, startAngle, finalEndAngle);

    // Generate rough inner arc (reversed)
    const innerPath = this.generateRoughArc(50, 50, this.innerRadius, finalEndAngle, startAngle, true);

    return `${outerPath} ${innerPath} Z`;
  }

  // Simple seeded random function for deterministic roughness
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Generate a rough/irregular arc path
  private generateRoughArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, reverse: boolean = false): string {
    const numPoints = Math.max(12, Math.ceil(Math.abs(endAngle - startAngle) / 8)); // More points for smoother but still rough
    const points: { x: number; y: number }[] = [];

    const angleStep = (endAngle - startAngle) / numPoints;

    for (let i = 0; i <= numPoints; i++) {
      const angle = startAngle + (angleStep * i);
      const rad = (angle * Math.PI) / 180;

      // Use seeded random based on angle for deterministic but rough effect
      const seed = angle * 100 + radius;
      const randomOffset = (this.seededRandom(seed) - 0.5) * this.roughness;
      const currentRadius = radius + randomOffset;

      const x = cx + currentRadius * Math.cos(rad);
      const y = cy + currentRadius * Math.sin(rad);
      points.push({ x, y });
    }

    // Build path with smooth curves for organic rough look
    let path = '';
    if (reverse) {
      // Reverse order for inner arc
      path = `M ${points[points.length - 1].x} ${points[points.length - 1].y}`;
      for (let i = points.length - 2; i >= 0; i--) {
        if (i === points.length - 2) {
          path += ` L ${points[i].x} ${points[i].y}`;
        } else {
          const cp1x = points[i + 1].x;
          const cp1y = points[i + 1].y;
          const cp2x = (points[i + 1].x + points[i].x) / 2;
          const cp2y = (points[i + 1].y + points[i].y) / 2;
          path += ` Q ${cp1x} ${cp1y} ${cp2x} ${cp2y}`;
        }
        if (i === 0) {
          path += ` L ${points[i].x} ${points[i].y}`;
        }
      }
    } else {
      path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        if (i === 1) {
          path += ` L ${points[i].x} ${points[i].y}`;
        } else {
          const cp1x = (points[i - 1].x + points[i].x) / 2;
          const cp1y = (points[i - 1].y + points[i].y) / 2;
          path += ` Q ${points[i - 1].x} ${points[i - 1].y} ${cp1x} ${cp1y}`;
        }
        if (i === points.length - 1) {
          path += ` L ${points[i].x} ${points[i].y}`;
        }
      }
    }

    return path;
  }

  toggleChartVariant(): void {
    this.chartVariant.update(v => v === 'glow' ? 'rough' : 'glow');
  }

  getPiePercentage(index: number): number {
    const grouped = this.groupedContributors();
    const total = this.contributorsTotal();
    if (total === 0) return 0;
    return Number(((grouped[index].amount / total) * 100).toFixed(2));
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
    navigator.clipboard.writeText(text);
  }

  formatIBAN(iban: string): string {
    // Format IBAN with spaces every 4 characters
    return iban.replace(/(.{4})/g, '$1 ').trim();
  }

  onImageError(): void {
    this.imageError.set(true);
  }

  /**
   * Get animation class for variant 8 (Elastic Stretch)
   * @param variant - Variant index (always 8)
   * @returns CSS class name for the animation
   */
  getAnimationClass(variant: number): string {
    return `text-animation-variant-8`;
  }

  /**
   * Get unique animation key that combines variant and text key
   * This ensures animations restart when text changes
   * @param variant - Variant index (always 8)
   * @returns Unique key string for animation tracking
   */
  getAnimationKey(variant: number): string {
    return `8-${this.textKey()}`;
  }

  /**
   * Get current text for variant 8
   * @param variant - Variant index (always 8 in this implementation)
   * @returns Current text from alternatives array
   */
  getCurrentText(variant: number): string {
    return this.textAlternatives()[this.textIndex()];
  }

  constructor() {
    this.initTextRotation();
  }

  /**
   * Initialize text rotation for variant 8 (Elastic Stretch animation)
   * Text changes every 8 seconds, cycling through all 6 alternatives
   */
  private initTextRotation(): void {
    const intervalTime = 8000; // Change text every 8 seconds (slower rotation)

    // Set up the interval to rotate text
    this.textRotationInterval = setInterval(() => {
      // Update to next text in the array (wraps around after last item)
      this.textIndex.update(index => (index + 1) % this.TEXT_COUNT);
      // Update key to trigger Angular change detection
      this.textKey.update(key => key + 1);

      /**
       * Force CSS animation restart using requestAnimationFrame
       * CSS animations don't automatically restart when content changes,
       * so we temporarily remove and re-add the animation style
       */
      requestAnimationFrame(() => {
        const element = document.querySelector(`[data-variant="8"]`);
        if (element) {
          // Temporarily remove animation to reset it
          (element as HTMLElement).style.animation = 'none';
          // Re-add animation in next frame to trigger restart
          requestAnimationFrame(() => {
            (element as HTMLElement).style.animation = '';
          });
        }
      });
    }, intervalTime);

    // Register cleanup using DestroyRef
    this.destroyRef.onDestroy(() => {
      if (this.textRotationInterval) {
        clearInterval(this.textRotationInterval);
      }
    });
  }
}
