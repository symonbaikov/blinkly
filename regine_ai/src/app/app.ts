import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from './services/state.service';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { TweaksPanelComponent } from './components/tweaks-panel/tweaks-panel.component';
import { LandingComponent } from './screens/landing/landing.component';
import { BrowseCatalogComponent } from './screens/browse-catalog/browse-catalog.component';
import { CategoriesComponent } from './screens/categories/categories.component';
import { CategoryComponent } from './screens/category/category.component';
import { DetailComponent } from './screens/detail/detail.component';
import { AboutComponent } from './screens/about/about.component';
import { FavoritesComponent } from './screens/favorites/favorites.component';
import { AccountComponent } from './screens/account/account.component';
import { SubmitComponent } from './screens/submit/submit.component';
import { SearchComponent } from './screens/search/search.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    TweaksPanelComponent,
    LandingComponent,
    BrowseCatalogComponent,
    CategoriesComponent,
    CategoryComponent,
    DetailComponent,
    AboutComponent,
    FavoritesComponent,
    AccountComponent,
    SubmitComponent,
    SearchComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  state = inject(StateService);

  get screen() { return this.state.screen(); }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      this.state.navigate({ name: 'search' });
    }
  }
}
