import { Component, ChangeDetectionStrategy, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
}

type FilterType = 'all' | 'active' | 'completed';

const STORAGE_KEY = 'todos';
const ANIMATION_DURATION = 600;

const ICON_NAMES = {
  PLUS: 'heroPlus',
  TRASH: 'heroTrash',
  CHECK_CIRCLE: 'heroCheckCircle',
  CHECK_CIRCLE_SOLID: 'heroCheckCircleSolid',
  X_CIRCLE: 'heroXCircle',
  PENCIL_SQUARE: 'heroPencilSquare',
  FUNNEL: 'heroFunnel',
  CHECK_BADGE: 'heroCheckBadge',
} as const;

const PRIORITY_COLORS = {
  high: 'bg-red-500 text-white dark:bg-red-600',
  medium: 'bg-yellow-500 text-white dark:bg-yellow-600',
  low: 'bg-green-500 text-white dark:bg-green-600',
  default: 'bg-slate-500 text-white',
} as const;

@Component({
  selector: 'app-todo',
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoComponent {
  private readonly formBuilder = inject(FormBuilder);

  // Icon names
  readonly icons = ICON_NAMES;

  // Form groups
  readonly newTodoForm = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    priority: ['medium' as const, [Validators.required]],
    dueDate: ['']
  });

  readonly editForm = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: ['']
  });

  // State signals
  private readonly _todos = signal<TodoItem[]>([]);
  readonly todos = this._todos.asReadonly();

  readonly filter = signal<FilterType>('all');
  readonly editingId = signal<string | null>(null);
  readonly showAddForm = signal<boolean>(false);
  readonly isClosing = signal<boolean>(false);

  // Computed values
  readonly filterOptions = computed<Array<{ value: FilterType; label: string; icon: string | null }>>(() => [
    { value: 'all', label: 'All', icon: ICON_NAMES.FUNNEL },
    { value: 'active', label: 'Active', icon: null },
    { value: 'completed', label: 'Completed', icon: ICON_NAMES.CHECK_BADGE }
  ]);

  readonly filteredTodos = computed(() => {
    const todos = this._todos();
    const filterValue = this.filter();
    
    switch (filterValue) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  });

  readonly stats = computed(() => {
    const todos = this._todos();
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      active: todos.filter(t => !t.completed).length
    };
  });

  constructor() {
    this.loadTodos();
    this.setupAutoSave();
  }

  // Todo CRUD operations
  addTodo(): void {
    if (this.newTodoForm.invalid) return;

    const formValue = this.newTodoForm.value;
    const newTodo: TodoItem = {
      id: this.generateId(),
      title: formValue.title!.trim(),
      description: formValue.description?.trim() || undefined,
      completed: false,
      priority: formValue.priority as 'low' | 'medium' | 'high',
      createdAt: new Date(),
      dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined
    };

    this._todos.update(todos => [...todos, newTodo]);
    this.resetNewTodoForm();
    this.closeForm();
  }

  toggleTodo(id: string): void {
    this._todos.update(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  deleteTodo(id: string): void {
    const todo = this._todos().find(t => t.id === id);
    const taskTitle = todo?.title || 'this task';
    
    if (this.confirmDelete(taskTitle)) {
      this._todos.update(todos => todos.filter(todo => todo.id !== id));
      if (this.editingId() === id) {
        this.cancelEdit();
      }
    }
  }

  startEditing(todo: TodoItem): void {
    this.editingId.set(todo.id);
    this.editForm.patchValue({
      title: todo.title,
      description: todo.description || ''
    });
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id || this.editForm.invalid) return;

    const formValue = this.editForm.value;
    const title = formValue.title!.trim();
    const description = formValue.description?.trim() || undefined;

    this._todos.update(todos =>
      todos.map(todo =>
        todo.id === id
          ? { ...todo, title, description }
          : todo
      )
    );

    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editForm.reset();
  }

  // Filter operations
  setFilter(filterType: FilterType): void {
    this.filter.set(filterType);
  }

  // Form operations
  toggleAddForm(): void {
    if (this.showAddForm()) {
      this.closeForm();
    } else {
      this.openForm();
    }
  }

  private openForm(): void {
    this.isClosing.set(false);
    this.showAddForm.set(true);
  }

  private closeForm(): void {
    this.isClosing.set(true);
    setTimeout(() => {
      this.showAddForm.set(false);
      this.isClosing.set(false);
    }, ANIMATION_DURATION);
  }

  private resetNewTodoForm(): void {
    this.newTodoForm.reset({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    });
  }

  // Utility methods
  getPriorityColor(priority: string): string {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.default;
  }

  getFilterButtonClass(filterType: FilterType): string {
    const isActive = this.filter() === filterType;
    const baseClasses = 'px-4 py-2 rounded-lg font-inter transition-colors duration-200 hover:opacity-80 flex items-center gap-2';
    
    if (isActive) {
      return `${baseClasses} bg-[#f29f67] dark:bg-[#8833cc] text-white`;
    }
    return `${baseClasses} bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300`;
  }

  getTodoCardClass(priority: 'low' | 'medium' | 'high'): string {
    const baseClasses = 'bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-l-4';
    const borderClasses = {
      high: 'border-red-500',
      medium: 'border-yellow-500',
      low: 'border-green-500'
    };
    return `${baseClasses} ${borderClasses[priority]}`;
  }

  private generateId(): string {
    return Date.now().toString();
  }

  private confirmDelete(taskTitle: string): boolean {
    return window.confirm(`Are you sure you want to delete "${taskTitle}"?`);
  }

  // LocalStorage operations
  private loadTodos(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored).map((t: TodoItem & { createdAt: string; dueDate?: string }) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined
        }));
        this._todos.set(parsed);
      }
    } catch (error) {
      console.error('Failed to load todos', error);
    }
  }

  private setupAutoSave(): void {
    effect(() => {
      const todos = this._todos();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.map(t => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
          dueDate: t.dueDate?.toISOString()
        }))));
      } catch (error) {
        console.error('Failed to save todos', error);
      }
    });
  }
}