import { Component, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconsModule } from '@ng-icons/core';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  color: string;
  createdAt: Date;
}

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule, NgIconsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent {
  readonly heroChevronLeft = 'heroChevronLeft';
  readonly heroChevronRight = 'heroChevronRight';
  readonly heroPlus = 'heroPlus';
  readonly heroTrash = 'heroTrash';
  readonly heroXMark = 'heroXMark';
  readonly heroClock = 'heroClock';
  readonly heroCalendarDays = 'heroCalendarDays';
  readonly heroPencilSquare = 'heroPencilSquare';

  readonly currentDate = signal<Date>(new Date());
  readonly selectedDate = signal<Date | null>(null);
  readonly showEventModal = signal<boolean>(false);
  readonly editingEvent = signal<CalendarEvent | null>(null);

  // Event form fields
  readonly eventTitle = signal<string>('');
  readonly eventDescription = signal<string>('');
  readonly eventDate = signal<string>('');
  readonly eventStartTime = signal<string>('');
  readonly eventEndTime = signal<string>('');
  readonly eventColor = signal<string>('#f29f67');

  private readonly _events = signal<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly standup with the team',
      date: new Date(2024, new Date().getMonth(), new Date().getDate() + 1),
      startTime: '10:00',
      endTime: '11:00',
      color: '#f29f67',
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Project Deadline',
      description: 'Submit final project deliverables',
      date: new Date(2024, new Date().getMonth(), new Date().getDate() + 5),
      color: '#ef4444',
      createdAt: new Date()
    }
  ]);

  readonly events = this._events.asReadonly();

  readonly currentMonth = computed(() => this.currentDate().getMonth());
  readonly currentYear = computed(() => this.currentDate().getFullYear());
  
  readonly monthName = computed(() => {
    const date = new Date(this.currentYear(), this.currentMonth(), 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  readonly calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  });

  readonly eventsByDate = computed(() => {
    const eventsMap = new Map<string, CalendarEvent[]>();
    this._events().forEach(event => {
      const key = this.getDateKey(event.date);
      if (!eventsMap.has(key)) {
        eventsMap.set(key, []);
      }
      eventsMap.get(key)!.push(event);
    });
    return eventsMap;
  });

  readonly selectedDateEvents = computed(() => {
    const date = this.selectedDate();
    if (!date) return [];
    const key = this.getDateKey(date);
    return this.eventsByDate().get(key) || [];
  });

  readonly upcomingEvents = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this._events()
      .filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  });

  constructor() {
    // Load events from localStorage FIRST, before creating the effect
    try {
      const stored = localStorage.getItem('calendarEvents');
      if (stored) {
        const parsed = JSON.parse(stored).map((e: any) => ({
          ...e,
          date: new Date(e.date),
          createdAt: new Date(e.createdAt)
        }));
        this._events.set(parsed);
      }
    } catch (e) {
      console.error('Failed to load calendar events', e);
    }

    // Create effect AFTER loading to watch for changes and save to localStorage
    effect(() => {
      const events = this._events();
      try {
        localStorage.setItem('calendarEvents', JSON.stringify(events.map((e: CalendarEvent) => ({
          ...e,
          date: e.date.toISOString(),
          createdAt: e.createdAt.toISOString()
        }))));
      } catch (err) {
        console.error('Failed to save calendar events', err);
      }
    });
  }

  previousMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentDate.set(newDate);
  }

  nextMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentDate.set(newDate);
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.selectedDate.set(new Date());
  }

  selectDate(date: Date | null): void {
    if (date) {
      this.selectedDate.set(date);
    }
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isSelected(date: Date | null): boolean {
    if (!date || !this.selectedDate()) return false;
    return date.toDateString() === this.selectedDate()!.toDateString();
  }

  getDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  getEventsForDate(date: Date | null): CalendarEvent[] {
    if (!date) return [];
    const key = this.getDateKey(date);
    return this.eventsByDate().get(key) || [];
  }

  openEventModal(date?: Date): void {
    this.editingEvent.set(null);
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      this.eventDate.set(dateStr);
      this.selectedDate.set(date);
    } else {
      const selected = this.selectedDate() || new Date();
      this.eventDate.set(selected.toISOString().split('T')[0]);
    }
    this.eventTitle.set('');
    this.eventDescription.set('');
    this.eventStartTime.set('');
    this.eventEndTime.set('');
    this.eventColor.set('#f29f67');
    this.showEventModal.set(true);
  }

  editEvent(event: CalendarEvent): void {
    this.editingEvent.set(event);
    this.eventTitle.set(event.title);
    this.eventDescription.set(event.description || '');
    this.eventDate.set(event.date.toISOString().split('T')[0]);
    this.eventStartTime.set(event.startTime || '');
    this.eventEndTime.set(event.endTime || '');
    this.eventColor.set(event.color);
    // Navigate to the month of the event if not already viewing it
    this.navigateToEventMonth(event.date);
    this.selectedDate.set(event.date);
    this.showEventModal.set(true);
  }

  navigateToEventMonth(date: Date): void {
    const eventMonth = date.getMonth();
    const eventYear = date.getFullYear();
    const currentMonth = this.currentMonth();
    const currentYear = this.currentYear();
    
    // Only navigate if we're not already viewing this month
    if (eventMonth !== currentMonth || eventYear !== currentYear) {
      this.currentDate.set(new Date(eventYear, eventMonth, 1));
    }
  }

  goToEvent(event: CalendarEvent): void {
    // Navigate to the month of the event and select the date
    this.navigateToEventMonth(event.date);
    this.selectedDate.set(event.date);
  }

  closeEventModal(): void {
    this.showEventModal.set(false);
    this.editingEvent.set(null);
  }

  saveEvent(): void {
    const title = this.eventTitle().trim();
    if (!title) return;

    const date = new Date(this.eventDate());
    
    if (this.editingEvent()) {
      // Update existing event
      this._events.update(events =>
        events.map(e =>
          e.id === this.editingEvent()!.id
            ? {
                ...e,
                title,
                description: this.eventDescription().trim() || undefined,
                date,
                startTime: this.eventStartTime() || undefined,
                endTime: this.eventEndTime() || undefined,
                color: this.eventColor()
              }
            : e
        )
      );
    } else {
      // Create new event
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title,
        description: this.eventDescription().trim() || undefined,
        date,
        startTime: this.eventStartTime() || undefined,
        endTime: this.eventEndTime() || undefined,
        color: this.eventColor(),
        createdAt: new Date()
      };
      this._events.update(events => [...events, newEvent]);
    }

    this.closeEventModal();
  }

  deleteEvent(id: string): void {
    const event = this._events().find(e => e.id === id);
    const eventTitle = event ? event.title : 'this event';
    
    if (confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      this._events.update(events => events.filter(e => e.id !== id));
    }
  }

  getDayName(dayIndex: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  }
}

