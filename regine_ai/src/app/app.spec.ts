import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { StateService } from './services/state.service';

describe('App', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => Object.keys(store).forEach(k => delete store[k]),
    });
  });

  afterEach(() => { vi.unstubAllGlobals(); });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialize screen from StateService', () => {
    TestBed.createComponent(App);
    const state = TestBed.inject(StateService);
    expect(state.screen().name).toBeTruthy();
  });
});
