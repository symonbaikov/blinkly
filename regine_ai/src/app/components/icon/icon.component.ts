import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `<svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" [class]="className" xmlns="http://www.w3.org/2000/svg" [innerHTML]="svgContent"></svg>`
})
export class IconComponent {
  @Input() name = '';
  @Input() size = 18;
  @Input() className = '';

  private paths: Record<string, string> = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    star: '<path d="m12 3 2.5 5.5L20 9.5l-4 4 1 5.5L12 16l-5 3 1-5.5-4-4 5.5-1Z"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 5 7 7-7 7"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="m11 5-7 7 7 7"/>',
    check: '<path d="m5 13 4 4L19 7"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    close: '<path d="m6 6 12 12"/><path d="m18 6-12 12"/>',
    menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    filter: '<path d="M3 5h18l-7 9v5l-4 2v-7L3 5Z"/>',
    doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6"/>',
    mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>',
    gauge: '<path d="M12 14v-3"/><circle cx="12" cy="14" r="8"/><path d="M12 6V3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    handshake: '<path d="M8 13 4 9l3-3 3 3m0 0 3-3 3 3m-3-3v3m-7 4 5 5 3-2 3 2 5-5"/>',
    steps: '<path d="M4 20h4v-4H4Zm6-6h4V10h-4Zm6-6h4V4h-4Z"/>',
    chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-8"/><path d="M22 20H2"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.6 6.8-4.2"/><path d="m8.6 13.4 6.8 4.2"/>',
    sliders: '<path d="M4 6h12"/><path d="M20 6h-2"/><circle cx="17" cy="6" r="2"/><path d="M4 18h6"/><path d="M14 18h6"/><circle cx="12" cy="18" r="2"/><path d="M4 12h4"/><path d="M12 12h8"/><circle cx="10" cy="12" r="2"/>',
    dollar: '<path d="M12 2v20"/><path d="M17 7H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H7"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/>',
    dot: '<circle cx="12" cy="12" r="3"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v7H3V3h7"/>',
    book: '<path d="M4 4h7a3 3 0 0 1 3 3v13"/><path d="M20 4h-7a3 3 0 0 0-3 3v13"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    bookmark: '<path d="M6 4h12v17l-6-4-6 4V4Z"/>',
    lightning: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>'
  };

  constructor(private sanitizer: DomSanitizer) {}

  get svgContent(): SafeHtml {
    const content = this.paths[this.name] || '<circle cx="12" cy="12" r="3"/>';
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
