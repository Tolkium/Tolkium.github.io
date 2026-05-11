import { Component, ChangeDetectionStrategy, signal, computed, inject, DestroyRef, Renderer2, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  GIFTS,
  TOTAL_GOAL,
  PAYMENT_INFO,
  calculateGiftChartData,
  getOverallContributors,
  getGiftRaised,
  type WishlistItem,
  type Contributor,
  type ChartData,
  type PaymentInfo,
} from '../../models/norbert-gift.model';
import {
  type Language,
  type NorbertGiftTranslations,
  TRANSLATIONS
} from './translations/norbert-gift-translations';

@Component({
  selector: 'app-norbert-gift',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './norbert-gift.component.html',
  styleUrls: ['./norbert-gift.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NorbertGiftComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  readonly gifts = GIFTS;
  readonly totalGoal = TOTAL_GOAL;
  readonly paymentInfo: PaymentInfo = PAYMENT_INFO;

  readonly activeGiftIndex = signal(0);
  readonly showModal = signal(false);
  readonly hoveredContributorIndex = signal<number | null>(null);
  readonly tooltipPosition = signal<{ x: number; y: number; placement: 'top' | 'bottom' } | null>(null);

  readonly currentLanguage = signal<Language>(this.detectBrowserLanguage());
  readonly t = computed<NorbertGiftTranslations>(() => TRANSLATIONS[this.currentLanguage()]);

  readonly textIndex = signal(5 % 6);
  readonly textKey = signal(0);
  private textRotationInterval: ReturnType<typeof setInterval> | null = null;

  private detectBrowserLanguage(): Language {
    const lang = navigator?.language || navigator?.languages?.[0] || 'en';
    return lang.toLowerCase().startsWith('sk') ? 'sk' : 'en';
  }

  toggleLanguage(): void {
    this.currentLanguage.update(l => l === 'en' ? 'sk' : 'en');
  }

  readonly textAlternatives = computed(() => this.t().textAlternatives);

  readonly overallRaised = computed(() => {
    return this.gifts.reduce((sum, g) => sum + getGiftRaised(g), 0);
  });

  readonly overallPercentage = computed(() => {
    return Math.min((this.overallRaised() / this.totalGoal) * 100, 100);
  });

  readonly overallContributors = computed(() => getOverallContributors());

  readonly uniqueContributorCount = computed(() => this.overallContributors().length);

  readonly topContributor = computed(() => {
    let top = { name: '', amount: 0 };
    this.overallContributors().forEach(c => {
      if (c.amount > top.amount) top = { name: c.name, amount: c.amount };
    });
    return top;
  });

  readonly overallChartData = computed<ChartData>(() => {
    const allContributors: Contributor[] = [];
    this.gifts.forEach(g => allContributors.push(...g.contributors));
    const byDate = new Map<string, number>();
    allContributors.forEach(c => {
      byDate.set(c.date, (byDate.get(c.date) || 0) + c.amount);
    });
    const sorted = Array.from(byDate.keys()).sort();
    const daily = sorted.map(d => byDate.get(d)!);
    const days = sorted.map(d => {
      const date = new Date(d);
      return `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
    });
    const total = allContributors.reduce((s, c) => s + c.amount, 0);
    const growth = sorted.map((_, i) => {
      const cumulative = daily.slice(0, i + 1).reduce((s, v) => s + v, 0);
      return Math.round((cumulative / this.totalGoal) * 100);
    });
    const velocity = sorted.map((_, i) => {
      const cumulative = daily.slice(0, i + 1).reduce((s, v) => s + v, 0);
      const dp = i + 1;
      const remaining = this.totalGoal - cumulative;
      const needed = remaining / Math.max(1, 60 - dp);
      const actual = cumulative / dp;
      return Number((actual - needed).toFixed(1));
    });
    return {
      dailyDonations: daily,
      days,
      growthTrend: growth,
      velocityTrend: velocity,
      growth: total > 0 ? Number(((total / this.totalGoal) * 100).toFixed(2)) : 0,
      totalRaised: total,
    };
  });

  readonly maxDonation = computed(() => {
    return Math.max(...this.overallChartData().dailyDonations, 1);
  });

  readonly pieSegments = computed(() => {
    const contributors = this.overallContributors();
    const total = this.overallRaised();
    if (total === 0 || contributors.length === 0) return [];

    const pieRadius = 40;
    let startAngle = -90;

    return contributors.map((contributor, index) => {
      const percentage = contributor.amount / total;
      const endAngle = startAngle + (percentage * 360);
      const isLast = index === contributors.length - 1;
      const finalEndAngle = isLast ? 270 : endAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (finalEndAngle * Math.PI) / 180;

      const x1 = 50 + pieRadius * Math.cos(startRad);
      const y1 = 50 + pieRadius * Math.sin(startRad);
      const x2 = 50 + pieRadius * Math.cos(endRad);
      const y2 = 50 + pieRadius * Math.sin(endRad);
      const largeArcFlag = percentage > 0.5 ? 1 : 0;

      const d = `M 50 50 L ${x1} ${y1} A ${pieRadius} ${pieRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      startAngle = finalEndAngle;

      return { d, color: contributor.color, name: contributor.name, amount: contributor.amount, percentage: Number((percentage * 100).toFixed(1)) };
    });
  });

  getGiftRaised(gift: WishlistItem): number {
    return getGiftRaised(gift);
  }

  getGiftPercentage(gift: WishlistItem): number {
    return Math.min((getGiftRaised(gift) / gift.price) * 100, 100);
  }

  getGiftChartData(gift: WishlistItem): ChartData {
    return calculateGiftChartData(gift);
  }

  getGiftMaxContributor(gift: WishlistItem): number {
    return Math.max(...gift.contributors.map(c => c.amount), 1);
  }

  getContributorBarWidth(amount: number, max: number): number {
    return (amount / max) * 100;
  }

  getBarWidth(value: number): number {
    return (value / this.maxDonation()) * 100;
  }

  getBarColor(value: number): string {
    const pct = (value / this.maxDonation()) * 100;
    if (pct < 30) return '#8b0000';
    if (pct < 60) return '#cc0000';
    return '#a0a0a0';
  }

  toggleGift(index: number): void {
    this.activeGiftIndex.update(current => current === index ? -1 : index);
  }

  openModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onContributorHover(index: number | null, event?: MouseEvent): void {
    this.hoveredContributorIndex.set(index);
    if (index !== null && event) {
      requestAnimationFrame(() => {
        const tw = 180;
        const th = 100;
        const pad = 15;
        let x = event.clientX + 15;
        let y = event.clientY - 10;
        let placement: 'top' | 'bottom' = 'top';
        if (x + tw > window.innerWidth - pad) x = event.clientX - tw - 15;
        if (x < pad) x = pad;
        if (y - th < pad) { y = event.clientY + 15; placement = 'bottom'; }
        if (y + th > window.innerHeight - pad) y = window.innerHeight - th - pad;
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
    return iban.replace(/(.{4})/g, '$1 ').trim();
  }

  getCurrentText(): string {
    return this.textAlternatives()[this.textIndex()];
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.addClass(document.body, 'norbert-gift-active');
    }

    const intervalTime = 8000;
    this.textRotationInterval = setInterval(() => {
      this.textIndex.update(i => (i + 1) % 6);
      this.textKey.update(k => k + 1);
      requestAnimationFrame(() => {
        const el = document.querySelector('[data-variant="gift"]');
        if (el) {
          (el as HTMLElement).style.animation = 'none';
          requestAnimationFrame(() => {
            (el as HTMLElement).style.animation = '';
          });
        }
      });
    }, intervalTime);
    this.destroyRef.onDestroy(() => {
      if (this.textRotationInterval) clearInterval(this.textRotationInterval);
      if (isPlatformBrowser(this.platformId)) {
        this.renderer.removeClass(document.body, 'norbert-gift-active');
      }
    });
  }
}
