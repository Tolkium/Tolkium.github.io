import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { TrustedUrlPipe } from './trusted-url.pipe';

export interface DesignEntry {
  name: string;
  url: string;
}

const ENTRY_SEP = '|';
const NAME_URL_SEP = '__';

function parseDesignsFromQuery(value: string | null): DesignEntry[] {
  if (!value || !value.trim()) return [];
  try {
    const entries = value.split(ENTRY_SEP).filter(Boolean);
    return entries
      .map((entry) => {
        const idx = entry.indexOf(NAME_URL_SEP);
        if (idx === -1) return null;
        const name = entry.slice(0, idx).trim();
        const url = decodeURIComponent(entry.slice(idx + NAME_URL_SEP.length).trim());
        if (!name || !url) return null;
        return { name, url };
      })
      .filter((e): e is DesignEntry => e !== null);
  } catch {
    return [];
  }
}

function buildDesignsQuery(designs: DesignEntry[]): string {
  return designs
    .map((d) => `${d.name}${NAME_URL_SEP}${d.url}`)
    .join(ENTRY_SEP);
}

@Component({
  selector: 'app-design-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, TrustedUrlPipe],
  templateUrl: './design-viewer.component.html',
  styleUrls: ['./design-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignViewerComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly designs = signal<DesignEntry[]>([]);
  readonly currentIndex = signal(0);
  readonly linkGeneratorOpen = signal(false);

  readonly currentDesign = computed(() => {
    const list = this.designs();
    const idx = this.currentIndex();
    if (list.length === 0) return null;
    return list[Math.max(0, Math.min(idx, list.length - 1))];
  });

  readonly currentUrl = computed(() => this.currentDesign()?.url ?? null);
  readonly hasDesigns = computed(() => this.designs().length > 0);

  readonly generatedLink = signal('');
  readonly linkCopied = signal(false);

  // Link builder form (for the collapsible generator)
  readonly builderEntries = signal<DesignEntry[]>([]);
  readonly builderName = signal('');
  readonly builderUrl = signal('');

  readonly currentTime = signal(this.formatTime(new Date()));

  private readonly designsParam = toSignal(
    this.route.queryParamMap.pipe(map((m) => m.get('designs'))),
    { initialValue: this.route.snapshot.queryParamMap.get('designs') }
  );

  constructor() {
    effect(() => {
      const q = this.designsParam();
      const parsed = parseDesignsFromQuery(q ?? null);
      this.designs.set(parsed);
      if (parsed.length > 0 && this.currentIndex() >= parsed.length) {
        this.currentIndex.set(0);
      }
    });
    setInterval(() => this.currentTime.set(this.formatTime(new Date())), 1000);
  }

  private formatTime(d: Date): string {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  setCurrentIndex(index: number): void {
    this.currentIndex.set(Math.max(0, Math.min(index, this.designs().length - 1)));
  }

  buildViewerLink(): string {
    const designs = this.builderEntries();
    const tree = this.router.createUrlTree(['/design-viewer'], {
      queryParams: designs.length > 0 ? { designs: buildDesignsQuery(designs) } : {},
    });
    return window.location.origin + this.router.serializeUrl(tree);
  }

  generateAndCopyLink(): void {
    const link = this.buildViewerLink();
    this.generatedLink.set(link);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        this.linkCopied.set(true);
        setTimeout(() => this.linkCopied.set(false), 2000);
      });
    }
  }

  addBuilderEntry(): void {
    const name = this.builderName().trim();
    const url = this.builderUrl().trim();
    if (!name || !url) return;
    this.builderEntries.update((list) => [...list, { name, url }]);
    this.builderName.set('');
    this.builderUrl.set('');
  }

  removeBuilderEntry(index: number): void {
    this.builderEntries.update((list) => list.filter((_, i) => i !== index));
  }

  toggleLinkGenerator(): void {
    this.linkGeneratorOpen.update((v) => !v);
  }

  isCurrentIndex(i: number): boolean {
    return this.currentIndex() === i;
  }
}
