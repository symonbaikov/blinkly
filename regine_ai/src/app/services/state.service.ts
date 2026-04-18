import { Injectable, signal, effect } from '@angular/core';
import { Lang } from './i18n';

export interface Screen {
  name: string;
  id?: string;
}

export interface Settings {
  variant: string;
  theme: string;
  font: string;
  accent: string;
  density: string;
  cardstyle: string;
}

export interface Filters {
  category: string | null;
  role: string | null;
  llm: string | null;
  level: string | null;
  access: string | null;
}

const DEFAULTS: Settings = {
  variant: 'medium',
  theme: 'light',
  font: 'inter',
  accent: 'orange',
  density: 'comfortable',
  cardstyle: 'elevated'
};

const ACCENTS: Record<string, { a: string; soft: string; deep: string }> = {
  orange: { a: '#FF6A1F', soft: '#FFE8D9', deep: '#D44A0F' },
  ember: { a: '#E8541A', soft: '#FFDDCA', deep: '#B8370A' },
  gold: { a: '#E39A24', soft: '#FFEBC7', deep: '#A66A00' }
};

const FONTS: Record<string, string> = {
  inter: "'Inter Tight', Inter, sans-serif",
  space: "'Space Grotesk', sans-serif",
  manrope: "'Manrope', sans-serif"
};

@Injectable({ providedIn: 'root' })
export class StateService {
  settings = signal<Settings>(this.loadSettings());
  screen = signal<Screen>(this.loadScreen());
  lang = signal<Lang>((localStorage.getItem('rengine-lang') as Lang) || 'ru');
  favs = signal<string[]>(this.loadFavs());
  filters = signal<Filters>({ category: null, role: null, llm: null, level: null, access: null });
  searchQuery = signal<string>('');
  toast = signal<string>('');
  tweaksOpen = signal<boolean>(true);

  constructor() {
    effect(() => {
      const s = this.settings();
      localStorage.setItem('rengine-tweaks', JSON.stringify(s));
      const root = document.documentElement;
      root.dataset['variant'] = s.variant;
      root.dataset['theme'] = s.theme;
      root.dataset['density'] = s.density;
      root.dataset['cardstyle'] = s.cardstyle;
      root.style.setProperty('--font-body', FONTS[s.font]);
      root.style.setProperty('--font-display', FONTS[s.font]);
      const a = ACCENTS[s.accent];
      if (a) {
        root.style.setProperty('--accent', a.a);
        root.style.setProperty('--accent-soft', a.soft);
        root.style.setProperty('--accent-deep', a.deep);
      }
    });

    effect(() => {
      localStorage.setItem('rengine-lang', this.lang());
      document.documentElement.lang = this.lang();
    });

    effect(() => {
      localStorage.setItem('rengine-favs', JSON.stringify(this.favs()));
    });
  }

  private loadSettings(): Settings {
    try {
      const saved = localStorage.getItem('rengine-tweaks');
      if (saved) return { ...DEFAULTS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULTS;
  }

  private loadScreen(): Screen {
    try {
      const s = localStorage.getItem('rengine-screen');
      if (s) return JSON.parse(s);
    } catch {}
    return { name: 'catalog' };
  }

  private loadFavs(): string[] {
    try {
      return JSON.parse(localStorage.getItem('rengine-favs') || '[]');
    } catch {
      return [];
    }
  }

  navigate(screen: Screen) {
    localStorage.setItem('rengine-screen', JSON.stringify(screen));
    this.screen.set(screen);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  toggleFav(id: string) {
    this.favs.update(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 1600);
  }

  updateSettings(partial: Partial<Settings>) {
    this.settings.update(s => ({ ...s, ...partial }));
  }
}
