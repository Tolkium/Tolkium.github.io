import { Directive, ElementRef, HostListener, OnDestroy, Input } from '@angular/core';

@Directive({
  selector: '[appCardSparkle]',
  standalone: true
})
export class CardSparkleDirective implements OnDestroy {
  @Input() appCardSparkle = true; // Enable/disable sparkle effect
  
  private lastMouseMoveTime = 0;
  private readonly THROTTLE_MS = 20;

  constructor(private el: ElementRef) {}

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.appCardSparkle) return;
    
    // Throttle for performance
    const now = Date.now();
    if (now - this.lastMouseMoveTime < this.THROTTLE_MS) {
      return;
    }
    this.lastMouseMoveTime = now;

    const card = this.el.nativeElement as HTMLElement;
    const rect = card.getBoundingClientRect();
    
    const l = event.clientX - rect.left;
    const t = event.clientY - rect.top;
    const h = rect.height;
    const w = rect.width;
    
    // Calculate percentages
    const px = Math.abs(Math.floor(100 / w * l) - 100);
    const py = Math.abs(Math.floor(100 / h * t) - 100);
    const pa = (50 - px) + (50 - py);
    
    // Sparkle follows cursor with damping
    const px_spark = 50 + ((l / w) * 100 - 50) / 1.5;
    const py_spark = 50 + ((t / h) * 100 - 50) / 1.5;
    const p_opc = 20 + Math.abs(pa) * 1.5;
    
    // Apply sparkle position and opacity
    card.style.setProperty('--spark-pos-x', `${px_spark}%`);
    card.style.setProperty('--spark-pos-y', `${py_spark}%`);
    card.style.setProperty('--sparkle-opacity', `${p_opc / 100}`);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    const card = this.el.nativeElement as HTMLElement;
    card.style.setProperty('--spark-pos-x', '50%');
    card.style.setProperty('--spark-pos-y', '50%');
    card.style.setProperty('--sparkle-opacity', '0.4');
  }

  ngOnDestroy(): void {
    // Reset values on destroy
    const card = this.el.nativeElement as HTMLElement;
    card.style.setProperty('--spark-pos-x', '50%');
    card.style.setProperty('--spark-pos-y', '50%');
    card.style.setProperty('--sparkle-opacity', '0.4');
  }
}

