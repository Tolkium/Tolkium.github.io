import { Injectable, signal, computed, effect, DestroyRef, inject } from '@angular/core';
import { CodeSnippet } from '../../models/snippet.model';

const STORAGE_KEY = 'snippet-vault';

@Injectable({
  providedIn: 'root'
})
export class SnippetVaultService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly _snippets = signal<CodeSnippet[]>(this.loadFromStorage());
  readonly snippets = this._snippets.asReadonly();

  readonly snippetsCount = computed(() => this._snippets().length);

  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Debounce auto-save to localStorage to avoid excessive writes
    effect(() => {
      const snippets = this._snippets();
      if (this.saveTimer) {
        clearTimeout(this.saveTimer);
      }
      this.saveTimer = setTimeout(() => {
        this.saveToStorage(snippets);
      }, 300);
    });

    // Clean up timer on destroy
    this.destroyRef.onDestroy(() => {
      if (this.saveTimer) {
        clearTimeout(this.saveTimer);
      }
    });
  }

  getSnippetById(id: string): CodeSnippet | undefined {
    return this._snippets().find(s => s.id === id);
  }

  createSnippet(snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt'>): CodeSnippet {
    const newSnippet: CodeSnippet = {
      ...snippet,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this._snippets.update(snippets => [...snippets, newSnippet]);
    return newSnippet;
  }

  updateSnippet(id: string, updates: Partial<Omit<CodeSnippet, 'id' | 'createdAt'>>): CodeSnippet | null {
    const snippet = this.getSnippetById(id);
    if (!snippet) return null;

    const updatedSnippet: CodeSnippet = {
      ...snippet,
      ...updates,
      updatedAt: new Date()
    };

    this._snippets.update(snippets =>
      snippets.map(s => s.id === id ? updatedSnippet : s)
    );

    return updatedSnippet;
  }

  deleteSnippet(id: string): boolean {
    const exists = this.getSnippetById(id);
    if (!exists) return false;

    this._snippets.update(snippets => snippets.filter(s => s.id !== id));
    return true;
  }

  searchSnippets(query: string): CodeSnippet[] {
    const lowerQuery = query.toLowerCase();
    return this._snippets().filter(snippet =>
      snippet.title.toLowerCase().includes(lowerQuery) ||
      snippet.description?.toLowerCase().includes(lowerQuery) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      snippet.html.toLowerCase().includes(lowerQuery) ||
      snippet.css.toLowerCase().includes(lowerQuery) ||
      snippet.javascript.toLowerCase().includes(lowerQuery)
    );
  }

  filterByTags(tags: string[]): CodeSnippet[] {
    if (tags.length === 0) return this._snippets();
    return this._snippets().filter(snippet =>
      tags.some(tag => snippet.tags.includes(tag))
    );
  }

  getAllTags(): string[] {
    const tagSet = new Set<string>();
    this._snippets().forEach(snippet => {
      snippet.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private loadFromStorage(): CodeSnippet[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt)
      }));
    } catch {
      return [];
    }
  }

  private saveToStorage(snippets: CodeSnippet[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
    } catch (error) {
      console.error('Failed to save snippets to localStorage:', error);
    }
  }
}

