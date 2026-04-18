import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { T } from '../../services/i18n';
import { CATEGORIES, LLMS } from '../../services/data';
import { IconComponent } from '../icon/icon.component';
import { StarsComponent } from '../stars/stars.component';

@Component({
  selector: 'app-prompt-card',
  standalone: true,
  imports: [CommonModule, IconComponent, StarsComponent],
  templateUrl: './prompt-card.component.html'
})
export class PromptCardComponent {
  @Input() prompt: any;
  @Input() isFav = false;
  @Input() compact = false;
  @Output() toggleFav = new EventEmitter<string>();
  @Output() open = new EventEmitter<string>();
  @Output() copy = new EventEmitter<any>();

  state = inject(StateService);

  get t() { return T[this.state.lang()]; }
  get lang() { return this.state.lang(); }

  get cat() {
    // Use pre-joined category data from API if available, else fall back to static lookup
    if (this.prompt?.categoryName) {
      return { name: this.prompt.categoryName, nameEn: this.prompt.categoryNameEn, icon: this.prompt.categoryIcon };
    }
    return CATEGORIES.find((c: any) => c.id === this.prompt?.category);
  }
  get title() { return this.lang === 'ru' ? this.prompt?.title : this.prompt?.titleEn; }
  get levelLabel() {
    const t = this.t;
    const map: Record<string, string> = { basic: t.level_basic, intermediate: t.level_intermediate, advanced: t.level_advanced };
    return map[this.prompt?.level] || this.prompt?.level;
  }

  getLlm(id: string) { return LLMS.find((x: any) => x.id === id); }
  getLlmInitial(llm: any): string {
    if (!llm) return '';
    return llm.id === 'yagpt' ? llm.name.slice(0, 2) : llm.name.slice(0, 1);
  }
  formatUses(): string {
    return this.prompt?.uses?.toLocaleString(this.lang === 'ru' ? 'ru-RU' : 'en-US') || '0';
  }
}
