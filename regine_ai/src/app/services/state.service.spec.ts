import { TestBed } from '@angular/core/testing';
import { StateService } from './state.service';

function mockLocalStorage() {
  const store: Record<string, string> = {};
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => Object.keys(store).forEach(k => delete store[k]),
  });
}

describe('StateService', () => {
  let service: StateService;

  beforeEach(() => {
    mockLocalStorage();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateService);
  });

  afterEach(() => { vi.unstubAllGlobals(); });

  it('should initialize with default screen catalog', () => {
    expect(service.screen().name).toBe('catalog');
  });

  it('navigate() changes screen signal and persists to localStorage', () => {
    service.navigate({ name: 'browse' });
    expect(service.screen().name).toBe('browse');
    const stored = JSON.parse(localStorage.getItem('rengine-screen') || '{}');
    expect(stored.name).toBe('browse');
  });

  it('navigate() with id stores the id', () => {
    service.navigate({ name: 'prompt', id: 'test-123' });
    expect(service.screen().id).toBe('test-123');
  });

  it('toggleFav() adds id to favs', () => {
    service.toggleFav('p1');
    expect(service.favs()).toContain('p1');
  });

  it('toggleFav() removes id if already in favs', () => {
    service.toggleFav('p1');
    service.toggleFav('p1');
    expect(service.favs()).not.toContain('p1');
  });

  it('toggleFav() persists favs to localStorage', () => {
    service.toggleFav('p1');
    TestBed.flushEffects();
    const stored = JSON.parse(localStorage.getItem('rengine-favs') || '[]');
    expect(stored).toContain('p1');
  });

  it('showToast() sets toast text and clears after 1600ms', async () => {
    vi.useFakeTimers();
    service.showToast('Скопировано');
    expect(service.toast()).toBe('Скопировано');
    vi.advanceTimersByTime(1600);
    expect(service.toast()).toBe('');
    vi.useRealTimers();
  });

  it('updateSettings() merges partial settings', () => {
    service.updateSettings({ accent: 'gold' });
    expect(service.settings().accent).toBe('gold');
    expect(service.settings().variant).toBe('medium');
  });
});
