import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { StoreService } from '../../services/store.service';
import { T } from '../../services/i18n';
import { IconComponent } from '../../components/icon/icon.component';
import { StarsComponent } from '../../components/stars/stars.component';
import { PromptCardComponent } from '../../components/prompt-card/prompt-card.component';
import { SkeletonCardComponent } from '../../components/skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, StarsComponent, PromptCardComponent, SkeletonCardComponent],
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  state = inject(StateService);
  store = inject(StoreService);
  vars: Record<string, string> = {};
  copied = false;

  get t() { return T[this.state.lang()]; }
  get lang() { return this.state.lang(); }
  get promptId() { return this.state.screen().id || ''; }
  get p() { return this.store.currentPrompt(); }
  get loading() { return this.store.loadingCurrentPrompt(); }
  get llms() { return this.store.llms(); }
  get skeletons3() { return [0, 1, 2]; }

  ngOnInit() {
    this.store.loadPrompt(this.promptId);
  }

  get cat() {
    if (!this.p) return null;
    return { id: this.p.category, name: this.p['categoryName'], nameEn: this.p['categoryNameEn'], icon: this.p['categoryIcon'] };
  }

  get promptText() { return this.p?.prompt || ''; }
  get variables(): Array<{ name: string; example: string }> { return (this.p?.variables as any) || []; }

  get renderedPrompt() {
    return this.promptText.replace(/\{\{(\w+)\}\}/g, (_: string, name: string) => this.vars[name] || `{{${name}}}`);
  }

  get highlightedParts(): Array<{ text: string; isVar: boolean }> {
    const parts = this.renderedPrompt.split(/(\{\{\w+\}\})/g);
    return parts.map((part: string) => ({
      text: part,
      isVar: /^\{\{\w+\}\}$/.test(part)
    }));
  }

  get similar() {
    if (!this.p) return [];
    return this.store.prompts().filter(x =>
      x.id !== this.p!.id && (x.category === this.p!.category || x.roles.some(r => this.p!.roles.includes(r)))
    ).slice(0, 3);
  }

  copyFilled() {
    navigator.clipboard?.writeText(this.renderedPrompt);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
    this.state.showToast(this.lang === 'ru' ? 'Скопировано' : 'Copied');
  }

  getRole(id: string) { return this.store.roles().find(r => r.id === id); }
  getLlm(id: string) { return this.llms.find(l => l.id === id); }
  getLlmInitial(llm: any): string {
    if (!llm) return '';
    return llm.id === 'yagpt' ? llm.name.slice(0, 2) : llm.name.slice(0, 1);
  }

  getRoles() { return (this.p?.roles || []).filter(r => r !== 'all'); }
  getVarValue(name: string) { return this.vars[name] || ''; }
  setVarValue(name: string, value: string) { this.vars = { ...this.vars, [name]: value }; }

  handleToggleFav(id: string) { this.state.toggleFav(id); }
  handleOpen(id: string) {
    this.state.navigate({ name: 'prompt', id });
    this.store.loadPrompt(id);
  }
  handleCopy(p: any) {
    navigator.clipboard?.writeText(p.prompt || '');
    this.state.showToast(this.lang === 'ru' ? 'Скопировано' : 'Copied');
  }

  formatUses() { return this.p?.uses?.toLocaleString('ru-RU') || '0'; }
  gaugeWidth(val: number, max: number) { return `${Math.min(100, val / max)}%`; }
  authorInitials() { return (this.p?.author || '').split(' ').map((s: string) => s[0]).join(''); }
}
