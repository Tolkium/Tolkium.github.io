import {
  Component,
  input,
  ChangeDetectionStrategy,
  inject,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgIconComponent } from '@ng-icons/core';
import { Store } from '@ngrx/store';
import { SearchResult, SearchResultTree } from '../../../core/services/search.service';
import { SearchService } from '../../../core/services/search.service';
import * as UiActions from '../../../core/store/ui.actions';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-results">
      @if (results().length === 0 && hasQuery()) {
        <div class="no-results">
          <p>No results found for "{{ query() }}"</p>
        </div>
      }
      
      @for (tree of results(); track tree.category) {
        <div class="result-category">
          <h3 class="category-title">{{ tree.category }}</h3>
          <div class="result-items">
            @for (item of tree.items; track item.id) {
              <button
                class="result-item"
                (click)="onItemClick(item)"
                [attr.aria-label]="'Navigate to ' + item.title"
              >
                @if (item.iconName) {
                  <ng-icon [name]="item.iconName" class="result-icon"></ng-icon>
                }
                <div class="result-content">
                  <span class="result-title" [innerHTML]="highlightText(item.title, item.highlightRanges)"></span>
                  @if (item.path && item.path.length > 0) {
                    <div class="result-path">
                      @for (segment of item.path; track $index; let isLast = $last) {
                        <span class="path-segment">{{ segment }}</span>
                        @if (!isLast) {
                          <ng-icon name="heroChevronRight" class="path-arrow"></ng-icon>
                        }
                      }
                    </div>
                  }
                  @if (item.description) {
                    <span 
                      class="result-description" 
                      [innerHTML]="highlightText(item.description, item.descriptionHighlightRanges || [])"
                    ></span>
                  }
                </div>
                <span class="result-score">{{ item.matchScore | number:'1.0-0' }}</span>
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly store = inject(Store);

  readonly results = input.required<SearchResultTree[]>();
  readonly query = input<string>('');
  readonly hasQuery = input<boolean>(false);
  readonly isMobile = input<boolean>(false);
  readonly itemSelected = output<SearchResult>();

  onItemClick(item: SearchResult): void {
    this.itemSelected.emit(item);
    
    // Close menu on mobile when a result is clicked
    if (this.isMobile()) {
      this.store.dispatch(UiActions.setMenuCollapse({ isCollapsed: true }));
    }
    
    if (item.route) {
      this.router.navigate([item.route]);
      this.searchService.clearQuery();
    }
  }

  highlightText(text: string, ranges: [number, number][]): SafeHtml {
    if (ranges.length === 0) {
      return this.sanitizer.bypassSecurityTrustHtml(text);
    }

    // Sort ranges by start position (reversed for easier processing)
    const sortedRanges = [...ranges].sort((a, b) => b[0] - a[0]);
    let result = text;

    sortedRanges.forEach(([start, end]) => {
      const before = result.substring(0, start);
      const match = this.escapeHtml(result.substring(start, end));
      const after = result.substring(end);
      result = `${before}<mark>${match}</mark>${after}`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(result);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

