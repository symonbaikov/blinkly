import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { T } from '../../services/i18n';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './about.component.html'
})
export class AboutComponent {
  state = inject(StateService);
  get t() { return T[this.state.lang()]; }
  get lang() { return this.state.lang(); }
  get steps() {
    const t = this.t;
    return [
      { n: '01', t: t.about_how_1_t, d: t.about_how_1_d },
      { n: '02', t: t.about_how_2_t, d: t.about_how_2_d },
      { n: '03', t: t.about_how_3_t, d: t.about_how_3_d }
    ];
  }
}
