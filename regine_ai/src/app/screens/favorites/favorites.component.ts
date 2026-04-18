import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { StoreService } from '../../services/store.service';
import { T } from '../../services/i18n';
import { IconComponent } from '../../components/icon/icon.component';
import { PromptCardComponent } from '../../components/prompt-card/prompt-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, IconComponent, PromptCardComponent, SkeletonCardComponent],
  templateUrl: './favorites.component.html'
})
export class FavoritesComponent {
  state = inject(StateService);
  store = inject(StoreService);
  skeletons = Array(3).fill(null);

  get t() { return T[this.state.lang()]; }
  get lang() { return this.state.lang(); }
  get loading() { return this.store.loadingPrompts(); }
  get saved() { return this.store.prompts().filter(p => this.state.favs().includes(p.id)); }

  handleToggleFav(id: string) { this.state.toggleFav(id); }
  handleOpen(id: string) { this.state.navigate({ name: 'prompt', id }); }
  handleCopy(p: any) {
    navigator.clipboard?.writeText(p.prompt || '');
    this.state.showToast(this.lang === 'ru' ? 'Скопировано' : 'Copied');
  }
}
