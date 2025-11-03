import {
  Directive,
  ElementRef,
  inject,
  DestroyRef,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appDraggable]',
  standalone: true,
  host: {
    '[style.cursor]': "'move'"
  }
})
export class DraggableDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  // Dragging state
  private readonly isDragging = signal(false);
  private dragState = { startX: 0, startY: 0, initialX: 0, initialY: 0 };

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.setupDragging();
    }
  }

  private setupDragging(): void {
    const element = this.elementRef.nativeElement;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left mouse button

      this.isDragging.set(true);
      this.dragState.startX = e.clientX;
      this.dragState.startY = e.clientY;

      const rect = element.getBoundingClientRect();
      this.dragState.initialX = rect.left;
      this.dragState.initialY = rect.top;

      e.preventDefault();
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!this.isDragging()) return;

      const deltaX = e.clientX - this.dragState.startX;
      const deltaY = e.clientY - this.dragState.startY;

      element.style.left = `${this.dragState.initialX + deltaX}px`;
      element.style.top = `${this.dragState.initialY + deltaY}px`;
      element.style.right = 'auto';
    };

    const handleMouseUp = () => {
      this.isDragging.set(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    element.addEventListener('mousedown', handleMouseDown);

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    });
  }
}

