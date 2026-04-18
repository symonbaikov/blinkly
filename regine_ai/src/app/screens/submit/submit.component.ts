import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { StoreService } from '../../services/store.service';
import { T } from '../../services/i18n';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submit.component.html'
})
export class SubmitComponent {
  state = inject(StateService);
  store = inject(StoreService);
  get t() { return T[this.state.lang()]; }
  get lang() { return this.state.lang(); }
  get categories() { return this.store.categories(); }
  get roles() { return this.store.roles().filter(r => r.id !== 'all'); }
  get llms() { return this.store.llms(); }

  form = { name: '', category: '', desc: '', prompt: '', example: '' };

  onSubmit() {
    alert(this.lang === 'ru' ? 'Промпт отправлен на модерацию' : 'Submitted for moderation');
  }

  tips() {
    const t = this.t;
    return [t.submit_tip_1, t.submit_tip_2, t.submit_tip_3, t.submit_tip_4];
  }
}
