import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({ name: 'trustedUrl', standalone: true })
export class TrustedUrlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  public transform(url: string | null): SafeResourceUrl | null {
    if (!url) return null;

    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return null;
      }
      return this.sanitizer.bypassSecurityTrustResourceUrl(parsed.href);
    } catch {
      return null;
    }
  }
}
