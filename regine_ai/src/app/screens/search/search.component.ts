import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { StoreService } from '../../services/store.service';
import { ApiService } from '../../services/api.service';
import { T } from '../../services/i18n';
import { IconComponent } from '../../components/icon/icon.component';
import { PromptCardComponent } from '../../components/prompt-card/prompt-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, PromptCardComponent, SkeletonCardComponent],
  templateUrl: './search.component.html'
})
export class SearchComponent {
  state = inject(StateService);
  store = inject(StoreService);
  api = inject(ApiService);

  get t() { return T[this.state.lang()]; }
  get lang() { return this.state.lang(); }

  query = '';
  results: any[] = [];
  loading = false;
  skeletons = Array(6).fill(null);
  suggestions = ['сварщик', 'ЧПУ', 'вахта', 'НАКС', 'boolean', 'скрининг', 'онбординг', 'оффер'];

  private searchTimer: any;

  async onQueryChange() {
    clearTimeout(this.searchTimer);
    if (!this.query) { this.results = []; return; }
    this.searchTimer = setTimeout(async () => {
      this.loading = true;
      try {
        this.results = await this.api.getPrompts({ q: this.query });
      } finally {
        this.loading = false;
      }
    }, 300);
  }

  handleToggleFav(id: string) { this.state.toggleFav(id); }
  handleOpen(id: string) { this.state.navigate({ name: 'prompt', id }); }
  handleCopy(p: any) {
    navigator.clipboard?.writeText(p.prompt || '');
    this.state.showToast(this.lang === 'ru' ? 'Скопировано' : 'Copied');
  }
}
