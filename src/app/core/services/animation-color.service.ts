import { Injectable, signal, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AnimationColorService {
  readonly color1 = signal('#f29f67');
  readonly color2 = signal('#8833cc');

  private readonly pathColors = new Map<string, { c1: string; c2: string }>([
    ['/norbert-gift', { c1: '#ffffff', c2: '#cc0000' }],
  ]);

  constructor() {
    this.matchFromUrl(location.pathname);

    try {
      const router = inject(Router);
      router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd)
      ).subscribe((e) => {
        this.matchFromUrl(e.urlAfterRedirects);
      });
    } catch {
      // Router not available
    }
  }

  private matchFromUrl(url: string): void {
    for (const [path, colors] of this.pathColors) {
      if (url.includes(path)) {
        this.color1.set(colors.c1);
        this.color2.set(colors.c2);
        return;
      }
    }
    this.color1.set('#f29f67');
    this.color2.set('#8833cc');
  }
}
