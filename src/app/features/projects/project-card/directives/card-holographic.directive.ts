import { Directive, ElementRef, HostListener, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appCardHolographic]',
  standalone: true
})
export class CardHolographicDirective implements OnDestroy {
  private lastMouseMoveTime = 0;
  private readonly THROTTLE_MS = 20;

  constructor(private el: ElementRef) {}

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
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
    
    // Calculate holographic gradient position with damping
    const lp = 50 + (px - 50) / 1.5;
    const tp = 50 + (py - 50) / 1.5;
    
    // Apply gradient position
    card.style.setProperty('--grad-pos-x', `${lp}%`);
    card.style.setProperty('--grad-pos-y', `${tp}%`);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    const card = this.el.nativeElement as HTMLElement;
    card.style.setProperty('--grad-pos-x', '50%');
    card.style.setProperty('--grad-pos-y', '50%');
  }

  ngOnDestroy(): void {
    // Reset values on destroy
    const card = this.el.nativeElement as HTMLElement;
    card.style.setProperty('--grad-pos-x', '50%');
    card.style.setProperty('--grad-pos-y', '50%');
  }
}

