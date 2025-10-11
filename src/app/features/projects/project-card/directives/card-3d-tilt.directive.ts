import { Directive, ElementRef, HostListener, OnDestroy, Input } from '@angular/core';

@Directive({
  selector: '[appCard3DTilt]',
  standalone: true
})
export class Card3DTiltDirective implements OnDestroy {
  @Input() appCard3DTilt = true; // Enable/disable 3D tilt effect
  
  private lastMouseMoveTime = 0;
  private readonly THROTTLE_MS = 20;

  constructor(private el: ElementRef) {}

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.appCard3DTilt) return;
    
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
    
    // Calculate 3D rotation values
    const lp = 50 + (px - 50) / 1.5;
    const tp = 50 + (py - 50) / 1.5;
    const ty = ((tp - 50) / 2) * -1;
    const tx = ((lp - 50) / 1.5) * 0.5;
    
    // Apply 3D tilt transform
    card.style.setProperty('--rotate-x', `${ty}deg`);
    card.style.setProperty('--rotate-y', `${tx}deg`);
    
    card.classList.add('active');
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    const card = this.el.nativeElement as HTMLElement;
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
    card.classList.remove('active');
  }

  ngOnDestroy(): void {
    // Reset values on destroy
    const card = this.el.nativeElement as HTMLElement;
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
  }
}

