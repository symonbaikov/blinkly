import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-tweaks-panel',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './tweaks-panel.component.html'
})
export class TweaksPanelComponent {
  state = inject(StateService);

  variants = ['safe', 'medium', 'bold'];
  fonts = [{ id: 'inter', label: 'Inter Tight' }, { id: 'space', label: 'Space Grotesk' }, { id: 'manrope', label: 'Manrope' }];
  accents = [{ id: 'orange', color: '#FF6A1F' }, { id: 'ember', color: '#E8541A' }, { id: 'gold', color: '#E39A24' }];
  densities = ['compact', 'comfortable', 'spacious'];
  cardstyles = ['flat', 'outlined', 'elevated'];

  update(key: string, val: string) {
    this.state.updateSettings({ [key]: val } as any);
  }
}
