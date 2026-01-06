import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { ConsoleMessage } from '../../../../models/snippet.model';

@Component({
  selector: 'app-console-panel',
  imports: [CommonModule, NgIconComponent],
  templateUrl: './console-panel.component.html',
  styleUrls: ['./console-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsolePanelComponent {
  readonly messages = input.required<ConsoleMessage[]>();
  readonly visible = input<boolean>(true);
  
  readonly clearRequested = output<void>();

  readonly messageTypes = {
    log: { icon: 'heroCommandLine', class: 'text-blue-400' },
    error: { icon: 'heroXCircle', class: 'text-red-400' },
    warn: { icon: 'heroExclamationTriangle', class: 'text-yellow-400' },
    info: { icon: 'heroInformationCircle', class: 'text-cyan-400' }
  } as const;

  onClear(): void {
    this.clearRequested.emit();
  }

  getMessageClass(type: ConsoleMessage['type']): string {
    return this.messageTypes[type]?.class || 'text-slate-400';
  }

  getMessageIcon(type: ConsoleMessage['type']): string {
    return this.messageTypes[type]?.icon || 'heroCommandLine';
  }

  formatMessage(message: ConsoleMessage): string {
    if (message.data && message.data.length > 0) {
      try {
        return message.data.map(d => 
          typeof d === 'object' ? JSON.stringify(d, null, 2) : String(d)
        ).join(' ');
      } catch {
        return message.message;
      }
    }
    return message.message;
  }
}

