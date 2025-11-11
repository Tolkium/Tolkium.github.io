import { Component, ChangeDetectionStrategy, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';

export interface StorageItem {
  key: string;
  value: string;
  size: number;
  sizeFormatted: string;
  isJson: boolean;
  jsonValue?: any;
}

const ICON_NAMES = {
  MAGNIFYING_GLASS: 'heroMagnifyingGlass',
  TRASH: 'heroTrash',
  PENCIL_SQUARE: 'heroPencilSquare',
  CHECK_CIRCLE: 'heroCheckCircle',
  X_CIRCLE: 'heroXCircle',
  ARROW_DOWN_TRAY: 'heroArrowDownTray',
  ARROW_UP_TRAY: 'heroArrowDownTray',
  CIRCLE_STACK: 'heroCircleStack',
  CLIPBOARD_DOCUMENT_LIST: 'heroClipboardDocumentList',
} as const;

@Component({
  selector: 'app-local-storage-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './local-storage-viewer.component.html',
  styleUrls: ['./local-storage-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalStorageViewerComponent {
  private readonly platformId = inject(PLATFORM_ID);

  readonly icons = ICON_NAMES;

  private readonly _items = signal<StorageItem[]>([]);
  readonly items = this._items.asReadonly();

  readonly searchQuery = signal<string>('');
  readonly editingKey = signal<string | null>(null);
  readonly editingValue = signal<string>('');
  readonly showAddForm = signal<boolean>(false);
  readonly newKey = signal<string>('');
  readonly newValue = signal<string>('');

  readonly filteredItems = computed(() => {
    const items = this._items();
    const query = this.searchQuery().toLowerCase().trim();
    
    if (!query) {
      return items;
    }
    
    return items.filter(item => 
      item.key.toLowerCase().includes(query) || 
      item.value.toLowerCase().includes(query)
    );
  });

  readonly stats = computed(() => {
    const items = this._items();
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);
    return {
      total: items.length,
      totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      usedPercentage: this.calculateUsedPercentage(totalSize)
    };
  });

  readonly isBrowser = computed(() => isPlatformBrowser(this.platformId));

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadItems();
      this.setupStorageListener();
    }
  }

  loadItems(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const storageItems: StorageItem[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          const size = this.calculateSize(key, value);
          const isJson = this.isJsonString(value);
          
          const item: StorageItem = {
            key,
            value,
            size,
            sizeFormatted: this.formatBytes(size),
            isJson,
            jsonValue: isJson ? JSON.parse(value) : undefined
          };
          
          storageItems.push(item);
        }
      }
      
      this._items.set(storageItems.sort((a, b) => a.key.localeCompare(b.key)));
    } catch (error) {
      console.error('Failed to load localStorage items', error);
    }
  }

  refresh(): void {
    this.loadItems();
  }

  startEdit(item: StorageItem): void {
    this.editingKey.set(item.key);
    this.editingValue.set(item.value);
  }

  saveEdit(): void {
    const key = this.editingKey();
    const newValue = this.editingValue().trim();
    
    if (!key || !newValue) {
      this.cancelEdit();
      return;
    }

    try {
      if (this.isJsonString(newValue)) {
        JSON.parse(newValue);
      }
      
      localStorage.setItem(key, newValue);
      this.loadItems();
      this.cancelEdit();
    } catch (error) {
      alert('Invalid JSON format. Please check your input.');
    }
  }

  cancelEdit(): void {
    this.editingKey.set(null);
    this.editingValue.set('');
  }

  deleteItem(key: string): void {
    if (confirm(`Are you sure you want to delete "${key}"?`)) {
      localStorage.removeItem(key);
      this.loadItems();
    }
  }

  clearAll(): void {
    const count = this._items().length;
    if (confirm(`Are you sure you want to delete all ${count} items? This action cannot be undone.`)) {
      localStorage.clear();
      this.loadItems();
    }
  }

  addItem(): void {
    const key = this.newKey().trim();
    const value = this.newValue().trim();
    
    if (!key || !value) {
      return;
    }

    if (localStorage.getItem(key)) {
      if (!confirm(`Key "${key}" already exists. Do you want to overwrite it?`)) {
        return;
      }
    }

    try {
      if (this.isJsonString(value)) {
        JSON.parse(value);
      }
      
      localStorage.setItem(key, value);
      this.loadItems();
      this.newKey.set('');
      this.newValue.set('');
      this.showAddForm.set(false);
    } catch (error) {
      alert('Invalid JSON format. Please check your input.');
    }
  }

  toggleAddForm(): void {
    this.showAddForm.update(show => !show);
    if (!this.showAddForm()) {
      this.newKey.set('');
      this.newValue.set('');
    }
  }

  exportAll(): void {
    try {
      const data: Record<string, string> = {};
      this._items().forEach(item => {
        data[item.key] = item.value;
      });
      
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `localStorage-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export localStorage data');
      console.error(error);
    }
  }

  importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (typeof data !== 'object' || Array.isArray(data)) {
          throw new Error('Invalid format');
        }

        const count = Object.keys(data).length;
        if (!confirm(`This will import ${count} items. Existing keys will be overwritten. Continue?`)) {
          input.value = '';
          return;
        }

        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'string') {
            localStorage.setItem(key, value);
          } else {
            localStorage.setItem(key, JSON.stringify(value));
          }
        });

        this.loadItems();
        input.value = '';
        alert(`Successfully imported ${count} items.`);
      } catch (error) {
        alert('Invalid JSON file. Please check the format.');
        console.error(error);
        input.value = '';
      }
    };
    
    reader.readAsText(file);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  }

  formatJson(value: string): string {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  }

  private calculateSize(key: string, value: string): number {
    return new Blob([key, value]).size;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  private calculateUsedPercentage(size: number): number {
    const maxSize = 5 * 1024 * 1024;
    return Math.min(100, (size / maxSize) * 100);
  }

  private isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  private setupStorageListener(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.addEventListener('storage', () => {
      this.loadItems();
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }
}

