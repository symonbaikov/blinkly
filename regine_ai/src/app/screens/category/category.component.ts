import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { StoreService } from '../../services/store.service';
import { T } from '../../services/i18n';
import { IconComponent } from '../../components/icon/icon.component';
import { PromptCardComponent } from '../../components/prompt-card/prompt-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, IconComponent, PromptCardComponent, SkeletonCardComponent],
  templateUrl: './category.component.html'
})
export class CategoryComponent {
  state = inject(StateService);
  store = inject(StoreService);
  skeletons = Array(6).fill(null);

  get t() { return T[this.state.lang()]; }
  get lang() { return this.state.lang(); }
  get categoryId() { return this.state.screen().id || ''; }
  get cat() { return this.store.categories().find(c => c.id === this.categoryId); }
  get prompts() { return this.store.prompts().filter(p => p.category === this.categoryId); }
  get loading() { return this.store.loadingPrompts(); }

  handleToggleFav(id: string) { this.state.toggleFav(id); }
  handleOpen(id: string) { this.state.navigate({ name: 'prompt', id }); }
  handleCopy(p: any) {
    navigator.clipboard?.writeText(p.prompt || '');
    this.state.showToast(this.lang === 'ru' ? 'Скопировано' : 'Copied');
  }
}
