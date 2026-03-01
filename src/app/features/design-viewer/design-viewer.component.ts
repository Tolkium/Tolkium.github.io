import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface DesignEntry {
  name: string;
  url: string;
  safeUrl: SafeResourceUrl;
}

/** Parses "designs" param: Name1|URL1;Name2|URL2. Returns name + url only. */
function parseDesignsParam(value: string | null): { name: string; url: string }[] {
  if (!value?.trim()) return [];
  const entries: { name: string; url: string }[] = [];
  const parts = value.split(';').map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    const pipeIndex = part.indexOf('|');
    if (pipeIndex === -1) continue;
    const name = decodeURIComponent(part.slice(0, pipeIndex).trim());
    const url = decodeURIComponent(part.slice(pipeIndex + 1).trim());
    if (!url) continue;
    try {
      new URL(url);
    } catch {
      continue;
    }
    entries.push({ name: name || `Design ${entries.length + 1}`, url });
  }
  return entries;
}

@Component({
  selector: 'app-design-viewer',
  imports: [CommonModule],
  templateUrl: './design-viewer.component.html',
  styleUrls: ['./design-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);

  readonly designs = signal<DesignEntry[]>([]);
  readonly currentIndex = signal(0);

  readonly currentDesign = computed(() => {
    const list = this.designs();
    const idx = this.currentIndex();
    if (list.length === 0) return null;
    return list[Math.max(0, Math.min(idx, list.length - 1))];
  });

  readonly hasDesigns = computed(() => this.designs().length > 0);
  readonly currentSafeUrl = computed(() => this.currentDesign()?.safeUrl ?? null);

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const raw = params['designs'] ?? params['d'] ?? '';
      const parsed = parseDesignsParam(raw);
      const list: DesignEntry[] = parsed.map((p) => ({
        name: p.name,
        url: p.url,
        safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(p.url),
      }));
      this.designs.set(list);

      const current = params['current'];
      const idx = current !== undefined ? parseInt(current, 10) : 0;
      this.currentIndex.set(isNaN(idx) ? 0 : Math.max(0, Math.min(idx, list.length - 1)));
    });
  }

  /** Example preview: Google.sk + AutoSCELEM. */
  readonly examplePreviewQuery = 'Google.sk|https://www.google.sk;AutoSCELEM|https://tolkium.net/autoscelem/';

  selectDesign(index: number): void {
    const list = this.designs();
    if (index < 0 || index >= list.length) return;
    this.currentIndex.set(index);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...this.route.snapshot.queryParams, current: index },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  openExamplePreview(): void {
    this.router.navigate(['/design-viewer'], {
      queryParams: { designs: this.examplePreviewQuery },
    });
  }
}
