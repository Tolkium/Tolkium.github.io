import { Component, input, output, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent } from '@ng-icons/core';
import { SnippetLanguage } from '../../../../models/snippet.model';

@Component({
  selector: 'app-snippet-editor',
  imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './snippet-editor.component.html',
  styleUrls: ['./snippet-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnippetEditorComponent {
  readonly html = input<string>('');
  readonly css = input<string>('');
  readonly javascript = input<string>('');

  readonly htmlChange = output<string>();
  readonly cssChange = output<string>();
  readonly javascriptChange = output<string>();

  readonly activeTab = signal<SnippetLanguage>('html');

  readonly tabConfig = [
    { id: 'html' as SnippetLanguage, label: 'HTML', icon: 'heroCodeBracket' },
    { id: 'css' as SnippetLanguage, label: 'CSS', icon: 'heroSwatch' },
    { id: 'javascript' as SnippetLanguage, label: 'JavaScript', icon: 'heroCommandLine' }
  ] as const;

  readonly activeContent = computed(() => {
    const tab = this.activeTab();
    switch (tab) {
      case 'html': return this.html();
      case 'css': return this.css();
      case 'javascript': return this.javascript();
    }
  });

  setActiveTab(tab: SnippetLanguage): void {
    this.activeTab.set(tab);
  }

  onContentChange(value: string): void {
    const tab = this.activeTab();
    switch (tab) {
      case 'html':
        this.htmlChange.emit(value);
        break;
      case 'css':
        this.cssChange.emit(value);
        break;
      case 'javascript':
        this.javascriptChange.emit(value);
        break;
    }
  }
}

