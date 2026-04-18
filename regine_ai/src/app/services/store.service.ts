import { Injectable, signal, inject } from '@angular/core';
import { ApiService, Prompt, Category, Role, Llm, PromptsFilter } from './api.service';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private api = inject(ApiService);

  categories = signal<Category[]>([]);
  roles = signal<Role[]>([]);
  llms = signal<Llm[]>([]);
  prompts = signal<Prompt[]>([]);
  loadingPrompts = signal(true);
  loadingMeta = signal(true);
  currentPrompt = signal<Prompt | null>(null);
  loadingCurrentPrompt = signal(false);

  constructor() {
    this.loadMeta();
    this.loadPrompts();
  }

  private async loadMeta() {
    this.loadingMeta.set(true);
    const [cats, roles, llms] = await Promise.all([
      this.api.getCategories(),
      this.api.getRoles(),
      this.api.getLlms()
    ]);
    this.categories.set(cats);
    this.roles.set(roles);
    this.llms.set(llms);
    this.loadingMeta.set(false);
  }

  async loadPrompts(filters: PromptsFilter = {}) {
    this.loadingPrompts.set(true);
    try {
      const data = await this.api.getPrompts(filters);
      this.prompts.set(data);
    } finally {
      this.loadingPrompts.set(false);
    }
  }

  async loadPrompt(id: string) {
    this.loadingCurrentPrompt.set(true);
    try {
      const p = await this.api.getPrompt(id);
      this.currentPrompt.set(p);
    } finally {
      this.loadingCurrentPrompt.set(false);
    }
  }

  getCategoryCount(id: string): number {
    return this.prompts().filter(p => p.category === id).length;
  }

  getRoleCount(roleId: string): number {
    return this.prompts().filter(p => p.roles.includes(roleId) || p.roles.includes('all')).length;
  }
}
