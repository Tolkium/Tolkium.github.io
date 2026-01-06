import { Component, ChangeDetectionStrategy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { SnippetVaultService } from '../../core/services/snippet-vault.service';
import { CodeSnippet, ConsoleMessage } from '../../models/snippet.model';
import { SnippetCardComponent } from './components/snippet-card/snippet-card.component';
import { SnippetEditorComponent } from './components/snippet-editor/snippet-editor.component';
import { LivePreviewComponent } from './components/live-preview/live-preview.component';
import { ConsolePanelComponent } from './components/console-panel/console-panel.component';

@Component({
  selector: 'app-snippet-vault',
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    SnippetCardComponent,
    SnippetEditorComponent,
    LivePreviewComponent,
    ConsolePanelComponent
  ],
  templateUrl: './snippet-vault.component.html',
  styleUrls: ['./snippet-vault.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnippetVaultComponent {
  private readonly snippetService = inject(SnippetVaultService);

  // State signals
  readonly snippets = this.snippetService.snippets;
  readonly selectedSnippetId = signal<string | null>(null);
  readonly searchQuery = signal<string>('');
  readonly showConsole = signal<boolean>(false);
  readonly isCreatingNew = signal<boolean>(false);
  readonly isEditingDescription = signal<boolean>(false);

  // Current editing snippet data
  readonly currentTitle = signal<string>('');
  readonly currentDescription = signal<string>('');
  readonly currentHtml = signal<string>('');
  readonly currentCss = signal<string>('');
  readonly currentJavascript = signal<string>('');
  readonly currentTags = signal<string[]>([]);
  readonly consoleMessages = signal<ConsoleMessage[]>([]);
  readonly newTag = signal<string>('');

  // Debounce timers for auto-save
  private titleSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private descriptionSaveTimer: ReturnType<typeof setTimeout> | null = null;

  // Computed values
  readonly filteredSnippets = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allSnippets = this.snippets();
    
    if (!query) return allSnippets;
    
    return allSnippets.filter(snippet =>
      snippet.title.toLowerCase().includes(query) ||
      snippet.description?.toLowerCase().includes(query) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(query)) ||
      snippet.html.toLowerCase().includes(query) ||
      snippet.css.toLowerCase().includes(query) ||
      snippet.javascript.toLowerCase().includes(query)
    );
  });

  readonly selectedSnippet = computed(() => {
    const id = this.selectedSnippetId();
    if (!id) return null;
    return this.snippets().find(s => s.id === id) || null;
  });

  readonly hasSelection = computed(() => this.selectedSnippetId() !== null || this.isCreatingNew());

  readonly allTags = computed(() => this.snippetService.getAllTags());

  constructor() {
    // Load selected snippet data when selection changes
    effect(() => {
      const snippet = this.selectedSnippet();
      if (snippet) {
        this.currentTitle.set(snippet.title);
        this.currentDescription.set(snippet.description || '');
        this.currentHtml.set(snippet.html);
        this.currentCss.set(snippet.css);
        this.currentJavascript.set(snippet.javascript);
        this.currentTags.set([...snippet.tags]);
        this.consoleMessages.set([]);
      } else if (this.isCreatingNew()) {
        this.currentTitle.set('');
        this.currentDescription.set('');
        this.currentHtml.set('');
        this.currentCss.set('');
        this.currentJavascript.set('');
        this.currentTags.set([]);
        this.consoleMessages.set([]);
      }
    });
  }

  onSnippetClick(snippet: CodeSnippet): void {
    this.selectedSnippetId.set(snippet.id);
    this.isCreatingNew.set(false);
  }

  onSnippetEdit(snippet: CodeSnippet): void {
    this.selectedSnippetId.set(snippet.id);
    this.isCreatingNew.set(false);
  }

  onSnippetDelete(id: string): void {
    if (confirm('Are you sure you want to delete this snippet?')) {
      this.snippetService.deleteSnippet(id);
      if (this.selectedSnippetId() === id) {
        this.selectedSnippetId.set(null);
        this.isCreatingNew.set(false);
      }
    }
  }

  onCreateNew(): void {
    this.selectedSnippetId.set(null);
    this.isCreatingNew.set(true);
  }

  onSaveSnippet(): void {
    const title = this.currentTitle().trim();
    if (!title) {
      alert('Please enter a title for your snippet');
      return;
    }

    const snippetData = {
      title,
      description: this.currentDescription().trim(),
      html: this.currentHtml(),
      css: this.currentCss(),
      javascript: this.currentJavascript(),
      tags: this.currentTags()
    };

    if (this.isCreatingNew()) {
      this.snippetService.createSnippet(snippetData);
      this.isCreatingNew.set(false);
      this.selectedSnippetId.set(null);
    } else {
      const id = this.selectedSnippetId();
      if (id) {
        this.snippetService.updateSnippet(id, snippetData);
      }
    }
  }

  onCancelEdit(): void {
    this.selectedSnippetId.set(null);
    this.isCreatingNew.set(false);
  }

  onTitleChange(title: string): void {
    this.currentTitle.set(title);
    // Debounce auto-save title if editing existing snippet
    if (this.selectedSnippetId() && !this.isCreatingNew()) {
      if (this.titleSaveTimer) {
        clearTimeout(this.titleSaveTimer);
      }
      const id = this.selectedSnippetId();
      if (id) {
        this.titleSaveTimer = setTimeout(() => {
          this.snippetService.updateSnippet(id, { title: title.trim() });
        }, 500);
      }
    }
  }

  onTitleBlur(): void {
    const title = this.currentTitle().trim();
    if (!title && !this.isCreatingNew()) {
      // Restore original title if empty
      const snippet = this.selectedSnippet();
      if (snippet) {
        this.currentTitle.set(snippet.title);
      }
    }
  }

  onDescriptionChange(description: string): void {
    this.currentDescription.set(description);
    // Debounce auto-save description if editing existing snippet
    if (this.selectedSnippetId() && !this.isCreatingNew()) {
      if (this.descriptionSaveTimer) {
        clearTimeout(this.descriptionSaveTimer);
      }
      const id = this.selectedSnippetId();
      if (id) {
        this.descriptionSaveTimer = setTimeout(() => {
          this.snippetService.updateSnippet(id, { description: description.trim() });
        }, 500);
      }
    }
  }

  onDescriptionBlur(): void {
    this.isEditingDescription.set(false);
  }

  startEditingDescription(): void {
    this.isEditingDescription.set(true);
  }

  private htmlSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private cssSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private jsSaveTimer: ReturnType<typeof setTimeout> | null = null;

  onHtmlChange(html: string): void {
    this.currentHtml.set(html);
    if (this.selectedSnippetId() && !this.isCreatingNew()) {
      if (this.htmlSaveTimer) {
        clearTimeout(this.htmlSaveTimer);
      }
      const id = this.selectedSnippetId();
      if (id) {
        this.htmlSaveTimer = setTimeout(() => {
          this.snippetService.updateSnippet(id, { html });
        }, 500);
      }
    }
  }

  onCssChange(css: string): void {
    this.currentCss.set(css);
    if (this.selectedSnippetId() && !this.isCreatingNew()) {
      if (this.cssSaveTimer) {
        clearTimeout(this.cssSaveTimer);
      }
      const id = this.selectedSnippetId();
      if (id) {
        this.cssSaveTimer = setTimeout(() => {
          this.snippetService.updateSnippet(id, { css });
        }, 500);
      }
    }
  }

  onJavascriptChange(javascript: string): void {
    this.currentJavascript.set(javascript);
    if (this.selectedSnippetId() && !this.isCreatingNew()) {
      if (this.jsSaveTimer) {
        clearTimeout(this.jsSaveTimer);
      }
      const id = this.selectedSnippetId();
      if (id) {
        this.jsSaveTimer = setTimeout(() => {
          this.snippetService.updateSnippet(id, { javascript });
        }, 500);
      }
    }
  }

  onTagsChange(tags: string[]): void {
    this.currentTags.set(tags);
    if (this.selectedSnippetId() && !this.isCreatingNew()) {
      const id = this.selectedSnippetId();
      if (id) {
        this.snippetService.updateSnippet(id, { tags });
      }
    }
  }

  addTag(): void {
    const tag = this.newTag().trim();
    if (tag && !this.currentTags().includes(tag)) {
      const newTags = [...this.currentTags(), tag];
      this.onTagsChange(newTags);
      this.newTag.set('');
    }
  }

  removeTag(tagToRemove: string): void {
    const newTags = this.currentTags().filter(tag => tag !== tagToRemove);
    this.onTagsChange(newTags);
  }

  onTagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  onConsoleMessages(messages: ConsoleMessage[]): void {
    this.consoleMessages.set(messages);
  }

  toggleConsole(): void {
    this.showConsole.update(v => !v);
  }
}

