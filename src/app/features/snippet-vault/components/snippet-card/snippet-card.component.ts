import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { CodeSnippet } from '../../../../models/snippet.model';

@Component({
  selector: 'app-snippet-card',
  imports: [CommonModule, NgIconComponent],
  templateUrl: './snippet-card.component.html',
  styleUrls: ['./snippet-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnippetCardComponent {
  readonly snippet = input.required<CodeSnippet>();
  readonly selected = input<boolean>(false);
  
  readonly cardClick = output<CodeSnippet>();
  readonly editClick = output<CodeSnippet>();
  readonly deleteClick = output<string>();

  onCardClick(): void {
    this.cardClick.emit(this.snippet());
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.editClick.emit(this.snippet());
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.deleteClick.emit(this.snippet().id);
  }

  getPreviewText(): string {
    const snippet = this.snippet();
    const html = snippet.html.trim();
    const css = snippet.css.trim();
    const js = snippet.javascript.trim();
    
    if (html) return html.substring(0, 100);
    if (css) return css.substring(0, 100);
    if (js) return js.substring(0, 100);
    return 'Empty snippet';
  }
}

