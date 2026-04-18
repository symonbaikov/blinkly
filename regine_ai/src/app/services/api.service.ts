import { Injectable } from '@angular/core';

const API = 'http://localhost:3000/api';

export interface Prompt {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  roles: string[];
  industries: string[];
  llm: string[];
  level: string;
  premium: boolean;
  rating: number;
  uses: number;
  saves: number;
  reviews: number;
  author: string;
  authorRole: string;
  authorCompany: string;
  updated: string;
  description: string;
  descriptionEn: string;
  prompt: string;
  example: string;
  variables: Array<{ name: string; example: string }>;
  icon: string;
  categoryName?: string;
  categoryNameEn?: string;
  categoryIcon?: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
}

export interface Role {
  id: string;
  name: string;
  nameEn: string;
}

export interface Llm {
  id: string;
  name: string;
  color: string;
}

export interface PromptsFilter {
  category?: string;
  role?: string;
  llm?: string;
  level?: string;
  access?: string;
  sort?: string;
  q?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API}/categories`);
    return res.json();
  }

  async getRoles(): Promise<Role[]> {
    const res = await fetch(`${API}/roles`);
    return res.json();
  }

  async getLlms(): Promise<Llm[]> {
    const res = await fetch(`${API}/llms`);
    return res.json();
  }

  async getPrompts(filters: PromptsFilter = {}): Promise<Prompt[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const res = await fetch(`${API}/prompts?${params}`);
    return res.json();
  }

  async getPrompt(id: string): Promise<Prompt> {
    const res = await fetch(`${API}/prompts/${id}`);
    return res.json();
  }
}
