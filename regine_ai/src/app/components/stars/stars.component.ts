import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stars',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="stars">
      <svg *ngFor="let s of starsArr; let i = index" width="12" height="12" viewBox="0 0 24 24">
        <defs>
          <linearGradient [id]="'sg-' + i + '-' + value">
            <stop [attr.offset]="getOffset(i) + '%'" stop-color="currentColor"/>
            <stop [attr.offset]="getOffset(i) + '%'" stop-color="transparent"/>
          </linearGradient>
        </defs>
        <path [attr.fill]="'url(#sg-' + i + '-' + value + ')'" stroke="currentColor" stroke-width="1" d="m12 3 2.5 5.5L20 9.5l-4 4 1 5.5L12 16l-5 3 1-5.5-4-4 5.5-1Z"/>
      </svg>
    </span>
  `
})
export class StarsComponent {
  @Input() value = 0;
  starsArr = [0, 1, 2, 3, 4];

  getOffset(i: number): number {
    const full = Math.floor(this.value);
    const frac = this.value - full;
    if (i < full) return 100;
    if (i === full) return frac * 100;
    return 0;
  }
}
