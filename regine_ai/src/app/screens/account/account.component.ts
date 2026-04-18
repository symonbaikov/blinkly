import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { StoreService } from '../../services/store.service';
import { T } from '../../services/i18n';
import { IconComponent } from '../../components/icon/icon.component';
import { PromptCardComponent } from '../../components/prompt-card/prompt-card.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, IconComponent, PromptCardComponent],
  templateUrl: './account.component.html'
})
export class AccountComponent {
  state = inject(StateService);
  store = inject(StoreService);
  get t() { return T[this.state.lang()]; }
  get lang() { return this.state.lang(); }
  get saved() { return this.store.prompts().filter(p => this.state.favs().includes(p.id)).slice(0, 4); }
  handleToggleFav(id: string) { this.state.toggleFav(id); }
  handleOpen(id: string) { this.state.navigate({ name: 'prompt', id }); }
  handleCopy(p: any) {
    navigator.clipboard?.writeText(p.prompt || p.body || '');
    this.state.showToast(this.lang === 'ru' ? 'Скопировано' : 'Copied');
  }
}
