import { Component, inject, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { StoreService } from '../../services/store.service';
import { T } from '../../services/i18n';
import { IconComponent } from '../../components/icon/icon.component';
import { PromptCardComponent } from '../../components/prompt-card/prompt-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-browse-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, PromptCardComponent, SkeletonCardComponent],
  templateUrl: './browse-catalog.component.html'
})
export class BrowseCatalogComponent {
  state = inject(StateService);
  store = inject(StoreService);

  sort = 'popular';
  query = '';
  skeletons = Array(6).fill(null);

  get t() { return T[this.state.lang()]; }
  get lang() { return this.state.lang(); }
  get filters() { return this.state.filters(); }
  get loading() { return this.store.loadingPrompts(); }
  get prompts() { return this.store.prompts(); }

  get categories() { return this.store.categories(); }
  get roles() { return this.store.roles().filter(r => r.id !== 'all'); }
  get llms() { return this.store.llms(); }
  get totalCount() { return this.prompts.length; }
  get freeCount() { return this.prompts.filter(p => !p.premium).length; }
  get premiumCount() { return this.prompts.filter(p => p.premium).length; }

  catCount(id: string) { return this.prompts.filter(p => p.category === id).length; }
  roleCount(id: string) { return this.prompts.filter(p => p.roles.includes(id)).length; }
  llmCount(id: string) { return this.prompts.filter(p => p.llm.includes(id)).length; }
  levelCount(lv: string) { return this.prompts.filter(p => p.level === lv).length; }

  levels = ['basic', 'intermediate', 'advanced'];

  applyFilters() {
    const f = this.filters;
    this.store.loadPrompts({
      category: f.category || undefined,
      role: f.role || undefined,
      llm: f.llm || undefined,
      level: f.level || undefined,
      access: f.access || undefined,
      sort: this.sort,
      q: this.query || undefined
    });
  }

  onSortChange() { this.applyFilters(); }
  onQueryChange() { this.applyFilters(); }

  clearAll() {
    this.state.filters.set({ category: null, role: null, llm: null, level: null, access: null });
    this.query = '';
    this.store.loadPrompts({ sort: this.sort });
  }

  hasActiveFilters() {
    const f = this.filters;
    return f.category || f.role || f.llm || f.level || f.access;
  }

  setFilter(key: string, val: string | null) {
    this.state.filters.update(f => ({ ...f, [key]: val }));
    this.applyFilters();
  }

  toggleFilter(key: string, val: string) {
    const current = (this.filters as any)[key];
    this.setFilter(key, current === val ? null : val);
  }

  getActiveCategoryName(): string {
    const cat = this.categories.find(c => c.id === this.filters.category);
    return cat ? (this.lang === 'ru' ? cat.name : cat.nameEn) : '';
  }

  handleToggleFav(id: string) { this.state.toggleFav(id); }
  handleOpen(id: string) { this.state.navigate({ name: 'prompt', id }); }
  handleCopy(p: any) {
    navigator.clipboard?.writeText(p.prompt || '');
    this.state.showToast(this.lang === 'ru' ? 'Скопировано' : 'Copied');
  }
}
