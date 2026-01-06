import { Component, input, effect, ChangeDetectionStrategy, signal, output, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConsoleMessage } from '../../../../models/snippet.model';

@Component({
  selector: 'app-live-preview',
  imports: [CommonModule],
  templateUrl: './live-preview.component.html',
  styleUrls: ['./live-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LivePreviewComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  readonly html = input<string>('');
  readonly css = input<string>('');
  readonly javascript = input<string>('');
  readonly consoleMessages = output<ConsoleMessage[]>();

  readonly previewContent = signal<SafeHtml>('');
  readonly consoleLogs = signal<ConsoleMessage[]>([]);

  private messageIdCounter = 0;
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastHtml = '';
  private lastCss = '';
  private lastJs = '';

  constructor() {
    // Set up message listener once
    if (typeof window !== 'undefined') {
      this.messageHandler = (event: MessageEvent) => {
        if (event.data?.type === 'console') {
          const message: ConsoleMessage = {
            id: `msg-${++this.messageIdCounter}`,
            type: event.data.consoleType,
            message: event.data.message,
            timestamp: new Date(),
            data: event.data.data
          };
          
          // Limit console logs to prevent memory bloat
          this.consoleLogs.update(logs => {
            const newLogs = [...logs, message];
            // Keep only last 100 messages
            return newLogs.length > 100 ? newLogs.slice(-100) : newLogs;
          });
          
          // Debounce console message emissions
          this.consoleMessages.emit(this.consoleLogs());
        }
      };

      window.addEventListener('message', this.messageHandler);

      // Clean up on destroy
      this.destroyRef.onDestroy(() => {
        if (this.messageHandler) {
          window.removeEventListener('message', this.messageHandler);
        }
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }
      });
    }

    // Debounce preview updates to avoid excessive re-renders
    // Increased debounce to 800ms to prevent iframe recreation spam
    effect(() => {
      const html = this.html();
      const css = this.css();
      const js = this.javascript();
      
      // Clear existing timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      
      // Debounce updates by 800ms to reduce iframe recreations
      this.debounceTimer = setTimeout(() => {
        this.updatePreview(html, css, js);
      }, 800);
    });
  }

  private updatePreview(html: string, css: string, js: string): void {
    // Only update if content actually changed to prevent unnecessary iframe reloads
    if (html === this.lastHtml && css === this.lastCss && js === this.lastJs) {
      return; // No changes, skip update
    }
    
    this.lastHtml = html;
    this.lastCss = css;
    this.lastJs = js;
    
    // Limit console logs to prevent memory issues
    const currentLogs = this.consoleLogs();
    if (currentLogs.length > 100) {
      // Keep only last 50 logs
      this.consoleLogs.set(currentLogs.slice(-50));
    }
    
    this.messageIdCounter = 0;

    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      padding: 1rem;
    }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    (function() {
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      const originalInfo = console.info;

      const sendMessage = (type, ...args) => {
        window.parent.postMessage({
          type: 'console',
          consoleType: type,
          message: args.map(arg => {
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg);
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          }).join(' '),
          data: args
        }, '*');
      };

      console.log = function(...args) {
        originalLog.apply(console, args);
        sendMessage('log', ...args);
      };

      console.error = function(...args) {
        originalError.apply(console, args);
        sendMessage('error', ...args);
      };

      console.warn = function(...args) {
        originalWarn.apply(console, args);
        sendMessage('warn', ...args);
      };

      console.info = function(...args) {
        originalInfo.apply(console, args);
        sendMessage('info', ...args);
      };

      try {
        ${js}
      } catch (error) {
        sendMessage('error', error.message, error.stack);
      }
    })();
  </script>
</body>
</html>
    `;

    this.previewContent.set(this.sanitizer.bypassSecurityTrustHtml(fullHtml));
  }
}

