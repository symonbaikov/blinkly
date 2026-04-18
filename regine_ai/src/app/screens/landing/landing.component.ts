import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { StoreService } from '../../services/store.service';
import { T } from '../../services/i18n';
import { IconComponent } from '../../components/icon/icon.component';
import { PromptCardComponent } from '../../components/prompt-card/prompt-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, IconComponent, PromptCardComponent, SkeletonCardComponent],
  templateUrl: './landing.component.html'
})
export class LandingComponent {
  state = inject(StateService);
  store = inject(StoreService);

  get t() { return T[this.state.lang()]; }
  get lang() { return this.state.lang(); }

  get categories() { return this.store.categories(); }
  get roles() { return this.store.roles().filter(r => r.id !== 'all'); }
  get loading() { return this.store.loadingPrompts(); }

  get featured() {
    return [...this.store.prompts()].sort((a, b) => b.uses - a.uses).slice(0, 6);
  }

  skeletons = Array(6).fill(null);

  get stats() {
    return [
      { v: '247', l: this.t.stat_prompts },
      { v: '9', l: this.t.stat_categories },
      { v: '3.4K', l: this.t.stat_recruiters },
      { v: '18.2K', l: this.t.stat_copies }
    ];
  }

  tickerItems() {
    const items = this.lang === 'ru'
      ? ['247 ПРОМПТОВ', 'МЕТАЛЛУРГИЯ', 'НЕФТЬ И ГАЗ', 'МАШИНОСТРОЕНИЕ', 'GPT · CLAUDE · YAGPT', 'ОБНОВЛЕНО СЕГОДНЯ', 'BLUE COLLAR', 'ВАХТА 30/30', 'НАКС I–IV', 'CNC FANUC · SIEMENS', '3400+ РЕКРУТЕРОВ']
      : ['247 PROMPTS', 'METALLURGY', 'OIL & GAS', 'MANUFACTURING', 'GPT · CLAUDE · YAGPT', 'UPDATED TODAY', 'BLUE COLLAR', 'ROTATION 30/30', 'NAKS I–IV', 'CNC FANUC · SIEMENS', '3400+ RECRUITERS'];
    return [...items, ...items];
  }

  howSteps() {
    const t = this.t;
    return [
      { n: '01', t: t.about_how_1_t, d: t.about_how_1_d, icon: 'filter' },
      { n: '02', t: t.about_how_2_t, d: t.about_how_2_d, icon: 'sliders' },
      { n: '03', t: t.about_how_3_t, d: t.about_how_3_d, icon: 'copy' }
    ];
  }

  getCategoryCount(id: string): number {
    return this.store.prompts().filter(p => p.category === id).length;
  }

  getRoleCount(roleId: string): number {
    return this.store.prompts().filter(p => p.roles.includes(roleId) || p.roles.includes('all')).length;
  }

  handleToggleFav(id: string) { this.state.toggleFav(id); }
  handleOpen(id: string) { this.state.navigate({ name: 'prompt', id }); }
  handleCopy(p: any) {
    navigator.clipboard?.writeText(p.prompt || '');
    this.state.showToast(this.lang === 'ru' ? 'Скопировано' : 'Copied');
  }

  navigateToCategory(id: string) { this.state.navigate({ name: 'category', id }); }
  navigateToRoleBrowse(roleId: string) {
    this.state.filters.update(f => ({ ...f, role: roleId, category: null, llm: null, level: null, access: null }));
    this.state.navigate({ name: 'browse' });
  }
}
