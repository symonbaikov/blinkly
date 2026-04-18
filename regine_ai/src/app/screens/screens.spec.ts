import { TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../services/state.service';
import { StoreService } from '../services/store.service';
import { ApiService } from '../services/api.service';

import { LandingComponent } from './landing/landing.component';
import { BrowseCatalogComponent } from './browse-catalog/browse-catalog.component';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryComponent } from './category/category.component';
import { DetailComponent } from './detail/detail.component';
import { AboutComponent } from './about/about.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { AccountComponent } from './account/account.component';
import { SubmitComponent } from './submit/submit.component';
import { SearchComponent } from './search/search.component';

const mockApi = {
  getCategories: vi.fn().mockResolvedValue([]),
  getRoles: vi.fn().mockResolvedValue([]),
  getLlms: vi.fn().mockResolvedValue([]),
  getPrompts: vi.fn().mockResolvedValue([]),
  getPrompt: vi.fn().mockResolvedValue(null)
};

function mockLocalStorage() {
  const store: Record<string, string> = {};
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => Object.keys(store).forEach(k => delete store[k]),
  });
}

const screens: Array<{ name: string; component: Type<unknown> }> = [
  { name: 'Landing', component: LandingComponent },
  { name: 'BrowseCatalog', component: BrowseCatalogComponent },
  { name: 'Categories', component: CategoriesComponent },
  { name: 'Category', component: CategoryComponent },
  { name: 'Detail', component: DetailComponent },
  { name: 'About', component: AboutComponent },
  { name: 'Favorites', component: FavoritesComponent },
  { name: 'Account', component: AccountComponent },
  { name: 'Submit', component: SubmitComponent },
  { name: 'Search', component: SearchComponent },
];

describe('Screen smoke tests', () => {
  beforeEach(() => { mockLocalStorage(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  for (const { name, component } of screens) {
    it(`${name} renders without errors`, async () => {
      await TestBed.configureTestingModule({
        imports: [component, CommonModule],
        providers: [
          StateService,
          StoreService,
          { provide: ApiService, useValue: mockApi }
        ]
      }).compileComponents();
      const fixture = TestBed.createComponent(component);
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  }
});
