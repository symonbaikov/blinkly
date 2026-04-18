import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { T } from '../../services/i18n';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  state = inject(StateService);
  get t() { return T[this.state.lang()]; }
  year = new Date().getFullYear();
}
