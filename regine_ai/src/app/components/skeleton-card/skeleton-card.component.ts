import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-card skeleton-card" [style.min-height]="compact ? 'auto' : '220px'"
         style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;gap:8px;align-items:center">
        <div class="skel skel-tag"></div>
        <div class="skel skel-tag" style="width:60px"></div>
      </div>
      <div class="skel skel-title"></div>
      <div *ngIf="!compact">
        <div class="skel skel-line" style="width:100%"></div>
        <div class="skel skel-line" style="width:75%;margin-top:6px"></div>
      </div>
      <div style="flex:1"></div>
      <div style="display:flex;gap:12px;align-items:center">
        <div class="skel" style="width:80px;height:12px;border-radius:4px"></div>
        <div class="skel" style="width:60px;height:12px;border-radius:4px"></div>
      </div>
      <div style="display:flex;gap:8px">
        <div class="skel skel-btn" style="flex:1"></div>
        <div class="skel skel-btn" style="width:80px"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-card { pointer-events: none; }
    .skel {
      background: linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 6px;
    }
    .skel-tag { width: 80px; height: 22px; border-radius: var(--radius-tag, 6px); }
    .skel-title { width: 90%; height: 20px; border-radius: 6px; }
    .skel-line { height: 13px; }
    .skel-btn { height: 30px; border-radius: var(--radius-btn, 10px); }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonCardComponent {
  @Input() compact = false;
}
