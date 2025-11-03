import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  category: string;
  uploadedAt: Date;
}

type ViewMode = 'carousel' | 'grid';

const ICON_NAMES = {
  PHOTO: 'heroPhoto',
  MAGNIFYING_GLASS: 'heroMagnifyingGlass',
  X_MARK: 'heroXMark',
} as const;

const ALL_CATEGORIES = 'All';
const DEFAULT_VIEW_MODE: ViewMode = 'grid';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent {
  private readonly formBuilder = inject(FormBuilder);

  // Icon names
  readonly icons = ICON_NAMES;

  // Form group for search
  readonly searchForm = this.formBuilder.group({
    query: ['']
  });

  // State signals
  private readonly _images = signal<GalleryImage[]>(this.getInitialImages());
  readonly images = this._images.asReadonly();

  readonly selectedCategory = signal<string>(ALL_CATEGORIES);
  readonly selectedImage = signal<GalleryImage | null>(null);
  readonly currentIndex = signal<number>(0);
  readonly viewMode = signal<ViewMode>(DEFAULT_VIEW_MODE);

  // Computed values
  readonly searchQuery = computed(() => this.searchForm.get('query')?.value || '');

  readonly categories = computed(() => {
    const categories = new Set(this._images().map(img => img.category));
    return [ALL_CATEGORIES, ...Array.from(categories).sort()];
  });

  readonly filteredImages = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.selectedCategory();
    
    return this._images().filter(img => {
      const matchesSearch = !query || 
        img.title.toLowerCase().includes(query) ||
        img.description?.toLowerCase().includes(query);
      const matchesCategory = category === ALL_CATEGORIES || img.category === category;
      return matchesSearch && matchesCategory;
    });
  });

  readonly displayedImages = computed(() => {
    const filtered = this.filteredImages();
    if (filtered.length === 0) return null;
    
    const current = this.currentIndex();
    const total = filtered.length;
    
    // Ensure currentIndex is within bounds
    const safeIndex = Math.max(0, Math.min(current, total - 1));
    
    // Get previous, current, and next indices
    const prev = safeIndex === 0 ? total - 1 : safeIndex - 1;
    const next = safeIndex === total - 1 ? 0 : safeIndex + 1;
    
    return {
      prev: filtered[prev],
      current: filtered[safeIndex],
      next: filtered[next]
    };
  });

  readonly visibleThumbnails = computed(() => this.filteredImages());

  constructor() {
    this.setupSearchSubscription();
  }

  // Image selection operations
  selectImage(image: GalleryImage): void {
    const filtered = this.filteredImages();
    const index = filtered.findIndex(img => img.id === image.id);
    if (index !== -1) {
      this.currentIndex.set(index);
    }
    this.selectedImage.set(image);
  }

  closeModal(): void {
    this.selectedImage.set(null);
  }

  // Category operations
  setCategory(category: string): void {
    this.selectedCategory.set(category);
    this.currentIndex.set(0);
  }

  // Navigation operations
  goToIndex(index: number): void {
    const filtered = this.filteredImages();
    if (index >= 0 && index < filtered.length) {
      this.currentIndex.set(index);
    }
  }

  goToPrevious(): void {
    const filtered = this.filteredImages();
    const current = this.currentIndex();
    this.currentIndex.set(current === 0 ? filtered.length - 1 : current - 1);
  }

  goToNext(): void {
    const filtered = this.filteredImages();
    const current = this.currentIndex();
    this.currentIndex.set(current === filtered.length - 1 ? 0 : current + 1);
  }

  clickSideImage(direction: 'prev' | 'next'): void {
    if (direction === 'prev') {
      this.goToPrevious();
    } else {
      this.goToNext();
    }
  }

  // View mode operations
  switchViewMode(): void {
    this.viewMode.update(mode => mode === 'carousel' ? 'grid' : 'carousel');
  }

  // Utility methods
  getCategoryButtonClass(category: string): string {
    const baseClasses = 'px-4 py-2 rounded-lg font-inter transition-colors duration-200 hover:opacity-80';
    const isActive = this.selectedCategory() === category;
    
    if (isActive) {
      return `${baseClasses} bg-[#f29f67] dark:bg-[#8833cc] text-white`;
    }
    return `${baseClasses} bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300`;
  }

  onImageError(event: Event, image: GalleryImage): void {
    const imgElement = event.target as HTMLImageElement;
    console.error(`Failed to load image: ${image.title}`, image.url);
    
    // Hide the image on error
    imgElement.style.display = 'none';
    
    // Could set a placeholder here if needed
    // imgElement.src = 'path/to/placeholder.png';
  }

  // Private helper methods
  private setupSearchSubscription(): void {
    this.searchForm.get('query')?.valueChanges.subscribe(() => {
      this.currentIndex.set(0);
    });
  }

  private getInitialImages(): GalleryImage[] {
    return [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
        title: 'Code Editor View',
        description: 'Clean code editor interface showcasing TypeScript development',
        category: 'Development',
        uploadedAt: new Date(2024, 0, 15)
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
        title: 'UI Design Mockup',
        description: 'Modern web application interface design',
        category: 'Design',
        uploadedAt: new Date(2024, 0, 20)
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
        title: 'Development Workspace',
        description: 'Professional coding setup with multiple monitors',
        category: 'Development',
        uploadedAt: new Date(2024, 1, 5)
      },
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1618401479427-c8ef9465fbe1?w=800&h=600&fit=crop',
        title: 'Angular Framework',
        description: 'Angular application architecture and components',
        category: 'Development',
        uploadedAt: new Date(2024, 1, 12)
      },
      {
        id: '5',
        url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop',
        title: 'Dashboard Design',
        description: 'Analytics dashboard interface with data visualizations',
        category: 'Design',
        uploadedAt: new Date(2024, 1, 18)
      },
      {
        id: '6',
        url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
        title: 'Responsive Design',
        description: 'Mobile-first responsive web design patterns',
        category: 'Design',
        uploadedAt: new Date(2024, 2, 2)
      },
      {
        id: '7',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
        title: 'API Integration',
        description: 'RESTful API development and integration workflow',
        category: 'Development',
        uploadedAt: new Date(2024, 2, 10)
      },
      {
        id: '8',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        title: 'Data Visualization',
        description: 'Interactive charts and graphs for analytics',
        category: 'Design',
        uploadedAt: new Date(2024, 2, 15)
      },
      {
        id: '9',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&auto=format&q=80',
        title: 'React Components',
        description: 'Component-based architecture in modern frameworks',
        category: 'Development',
        uploadedAt: new Date(2024, 2, 22)
      },
      {
        id: '10',
        url: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=600&fit=crop&auto=format&q=80',
        title: 'E-Commerce UI',
        description: 'Online shopping platform user interface',
        category: 'Design',
        uploadedAt: new Date(2024, 3, 1)
      },
      {
        id: '11',
        url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
        title: 'Version Control',
        description: 'Git workflow and collaborative development',
        category: 'Development',
        uploadedAt: new Date(2024, 3, 8)
      },
      {
        id: '12',
        url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop',
        title: 'Dark Mode Theme',
        description: 'Modern dark theme UI design implementation',
        category: 'Design',
        uploadedAt: new Date(2024, 3, 15)
      },
      {
        id: '13',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        title: 'Mobile App Design',
        description: 'Responsive mobile application interface',
        category: 'Design',
        uploadedAt: new Date(2024, 3, 22)
      },
      {
        id: '14',
        url: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&h=600&fit=crop',
        title: 'Cloud Infrastructure',
        description: 'Modern cloud architecture and deployment',
        category: 'Development',
        uploadedAt: new Date(2024, 4, 1)
      },
      {
        id: '15',
        url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
        title: 'Team Collaboration',
        description: 'Developer team working together',
        category: 'Development',
        uploadedAt: new Date(2024, 4, 8)
      },
      {
        id: '16',
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
        title: 'User Experience Design',
        description: 'UX research and design process',
        category: 'Design',
        uploadedAt: new Date(2024, 4, 15)
      },
      {
        id: '17',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
        title: 'Database Architecture',
        description: 'Database design and optimization',
        category: 'Development',
        uploadedAt: new Date(2024, 4, 22)
      },
      {
        id: '18',
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
        title: 'Security Implementation',
        description: 'Application security and encryption',
        category: 'Development',
        uploadedAt: new Date(2024, 5, 1)
      }
    ];
  }
}