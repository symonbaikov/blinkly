import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { T, Lang } from '../../services/i18n';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  state = inject(StateService);

  get t() { return T[this.state.lang()]; }

  links = [
    { id: 'browse', label: 'Browse Catalog' },
    { id: 'categories', label: '' },
    { id: 'about', label: '' },
    { id: 'submit', label: '' }
  ];

  setLang(l: string) { this.state.lang.set(l as Lang); }

  getLinkLabel(id: string): string {
    const t = this.t;
    const map: Record<string, string> = {
      browse: 'Browse Catalog',
      categories: t.nav_categories,
      about: t.nav_about,
      submit: t.nav_submit
    };
    return map[id] || id;
  }
}
