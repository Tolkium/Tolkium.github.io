export interface CodeSnippet {
  id: string;
  title: string;
  description?: string;
  html: string;
  css: string;
  javascript: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  preview?: string; // Base64 or data URL for preview image
}

export type SnippetLanguage = 'html' | 'css' | 'javascript';

export interface ConsoleMessage {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
  data?: unknown[];
}

