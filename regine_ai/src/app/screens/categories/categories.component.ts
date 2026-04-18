import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { StoreService } from '../../services/store.service';
import { T } from '../../services/i18n';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent {
  state = inject(StateService);
  store = inject(StoreService);
  get t() { return T[this.state.lang()]; }
  get lang() { return this.state.lang(); }
  get categories() { return this.store.categories(); }
  getCount(id: string) { return this.store.prompts().filter(p => p.category === id).length; }
}
