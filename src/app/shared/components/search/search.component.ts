import {
  Component,
  input,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  viewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIconComponent } from '@ng-icons/core';
import { Store } from '@ngrx/store';
import { selectIsMenuCollapsed } from '../../../core/store/ui.selectors';
import { SearchService } from '../../../core/services/search.service';
import { SearchResultsComponent } from './search-results.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent, SearchResultsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.mobile]': 'isMobile()',
    '[class.desktop]': '!isMobile()',
    '[class.active]': 'isOpen()',
    '[class.menu-collapsed]': 'isMenuCollapsed()'
  },
  template: `
    <div class="search-container" #searchContainer>
      @if (isMobile()) {
        <!-- Mobile: Simple button that opens dropdown -->
        <button
          class="search-trigger"
          (click)="toggleSearch()"
          [attr.aria-label]="isOpen() ? 'Close search' : 'Open search'"
          [attr.aria-expanded]="isOpen()"
        >
          <ng-icon name="heroMagnifyingGlass" class="search-icon"></ng-icon>
        </button>

        @if (isOpen()) {
          <div class="search-dropdown" #dropdown>
            <div class="search-input-wrapper">
              <ng-icon name="heroMagnifyingGlass" class="input-icon"></ng-icon>
              <input
                #searchInput
                type="text"
                class="search-input"
                [formControl]="searchControl"
                placeholder="Search... (e.g., 'eme' finds 'theme')"
                (keydown.escape)="closeSearch()"
                (keydown.arrowdown)="onArrowDown($event)"
                (focus)="onInputFocus()"
              />
              @if (searchControl.value && searchControl.value.length > 0) {
                <button
                  class="clear-btn"
                  (click)="clearSearch()"
                  aria-label="Clear search"
                >
                  <ng-icon name="heroXMark" class="clear-icon"></ng-icon>
                </button>
              }
            </div>

          @if (hasResults() || (searchControl.value && searchControl.value.length > 0)) {
            <app-search-results
              [results]="results()"
              [query]="(searchControl.value ?? '')"
              [hasQuery]="!!searchControl.value"
              [isMobile]="isMobile()"
              (itemSelected)="onResultSelected()"
            />
          }
          </div>
        }
      } @else {
        <!-- Desktop: Button becomes input when opened -->
        <div class="search-trigger-wrapper" [class.active]="isOpen()">
          <button
            class="search-trigger"
            (click)="toggleSearch()"
            [attr.aria-label]="isOpen() ? 'Close search' : 'Open search'"
            [attr.aria-expanded]="isOpen()"
            [class.has-input]="isOpen()"
          >
            <ng-icon name="heroMagnifyingGlass" class="search-icon"></ng-icon>
            @if (isOpen()) {
              <input
                #searchInput
                type="text"
                class="search-input-inline"
                [formControl]="searchControl"
                placeholder="Search (Ctrl+K)..."
                (keydown.escape)="closeSearch()"
                (keydown.arrowdown)="onArrowDown($event)"
                (focus)="onInputFocus()"
                (click)="$event.stopPropagation()"
              />
              @if (searchControl.value && searchControl.value.length > 0) {
                <button
                  class="clear-btn-inline"
                  (click)="clearSearch(); $event.stopPropagation()"
                  aria-label="Clear search"
                >
                  <ng-icon name="heroXMark" class="clear-icon"></ng-icon>
                </button>
              }
            }
          </button>
        </div>

        @if (isOpen() && (hasResults() || (searchControl.value && searchControl.value.length > 0))) {
          <div class="search-dropdown" #dropdown>
            <app-search-results
              [results]="results()"
              [query]="(searchControl.value ?? '')"
              [hasQuery]="!!searchControl.value"
              [isMobile]="false"
              (itemSelected)="onResultSelected()"
            />
          </div>
        }
      }
    </div>
  `,
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly searchService = inject(SearchService);
  private readonly store = inject(Store);
  private readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly dropdownRef = viewChild<ElementRef<HTMLDivElement>>('dropdown');
  private readonly containerRef = viewChild.required<ElementRef<HTMLDivElement>>('searchContainer');

  readonly isMobile = input<boolean>(false);
  readonly isMenuCollapsed = toSignal(this.store.select(selectIsMenuCollapsed), { initialValue: true });
  readonly isOpen = signal<boolean>(false);

  searchForm = this.formBuilder.group({
    query: ['']
  });

  readonly searchControl = this.searchForm.get('query') as FormControl<string | null>;

  // Debounced query signal
  private readonly debouncedQuery$ = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(150),
      distinctUntilChanged(),
      map(value => value || '')
    )
  );

  // Effect to update service query (cannot write to signals inside computed)
  private readonly updateQueryEffect = effect(() => {
    const query = this.debouncedQuery$();
    if (query) {
      this.searchService.setQuery(query);
    } else {
      this.searchService.clearQuery();
    }
  });

  readonly results = computed(() => {
    // Track debounced query to trigger updates
    this.debouncedQuery$();
    return this.searchService.searchResults();
  });

  readonly hasResults = computed(() => this.results().length > 0);

  // Auto-focus input when opened
  private readonly focusEffect = effect(() => {
    if (this.isOpen() && this.searchInputRef()) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        this.searchInputRef()?.nativeElement.focus();
      }, 0);
    }
  });

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Ctrl+K or Cmd+K to toggle search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.toggleSearch();
    }

    // Escape to close
    if (event.key === 'Escape' && this.isOpen()) {
      this.closeSearch();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen()) {
      const target = event.target as HTMLElement;
      
      // Check if click is outside the search container
      const container = this.containerRef().nativeElement;
      if (!container.contains(target)) {
        this.closeSearch();
      }
    }
  }

  toggleSearch(): void {
    if (this.isOpen()) {
      this.closeSearch();
    } else {
      this.openSearch();
    }
  }

  openSearch(): void {
    this.isOpen.set(true);
  }

  closeSearch(): void {
    this.isOpen.set(false);
    this.clearSearch();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchService.clearQuery();
  }

  onInputFocus(): void {
    // Ensure dropdown stays visible when input is focused
    if (!this.isOpen()) {
      this.openSearch();
    }
  }

  onArrowDown(event: Event): void {
    event.preventDefault();
  }

  onResultSelected(): void {
    this.closeSearch();
  }
}

