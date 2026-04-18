import { TestBed } from '@angular/core/testing';
import { StoreService } from './store.service';
import { ApiService, Category, Role, Llm, Prompt } from './api.service';

const mockCategories: Category[] = [
  { id: 'cv', name: 'Резюме', nameEn: 'Resume', icon: 'doc' },
  { id: 'interview', name: 'Интервью', nameEn: 'Interview', icon: 'mic' }
];
const mockRoles: Role[] = [
  { id: 'all', name: 'Все', nameEn: 'All' },
  { id: 'recruiter', name: 'Рекрутер', nameEn: 'Recruiter' }
];
const mockLlms: Llm[] = [
  { id: 'gpt4', name: 'GPT-4', color: '#74aa9c' }
];
const mockPrompts: Prompt[] = [
  {
    id: 'p1', title: 'Тест', titleEn: 'Test', category: 'cv',
    roles: ['recruiter'], industries: [], llm: ['gpt4'], level: 'basic',
    premium: false, rating: 4.5, uses: 10, saves: 5, reviews: 2,
    author: 'Test', authorRole: 'HR', authorCompany: 'NLMK',
    updated: '2024-01-01', description: 'Desc', descriptionEn: 'Desc EN',
    prompt: 'Prompt text', example: '', variables: [], icon: 'doc'
  }
];

describe('StoreService', () => {
  let service: StoreService;
  let apiSpy: {
    getCategories: ReturnType<typeof vi.fn>;
    getRoles: ReturnType<typeof vi.fn>;
    getLlms: ReturnType<typeof vi.fn>;
    getPrompts: ReturnType<typeof vi.fn>;
    getPrompt: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    apiSpy = {
      getCategories: vi.fn().mockResolvedValue(mockCategories),
      getRoles: vi.fn().mockResolvedValue(mockRoles),
      getLlms: vi.fn().mockResolvedValue(mockLlms),
      getPrompts: vi.fn().mockResolvedValue(mockPrompts),
      getPrompt: vi.fn().mockResolvedValue(mockPrompts[0])
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: apiSpy }]
    });
    service = TestBed.inject(StoreService);
  });

  it('should create service and call API methods on init', () => {
    expect(service).toBeTruthy();
    expect(apiSpy.getCategories).toHaveBeenCalled();
    expect(apiSpy.getPrompts).toHaveBeenCalled();
  });

  it('loadMeta() populates categories, roles, llms', async () => {
    await TestBed.runInInjectionContext(() => service['loadMeta']());
    expect(service.categories()).toEqual(mockCategories);
    expect(service.roles()).toEqual(mockRoles);
    expect(service.llms()).toEqual(mockLlms);
  });

  it('getCategoryCount() counts correctly after prompts loaded', async () => {
    await service.loadPrompts();
    expect(service.getCategoryCount('cv')).toBe(1);
    expect(service.getCategoryCount('interview')).toBe(0);
  });

  it('getRoleCount() counts correctly', async () => {
    await service.loadPrompts();
    expect(service.getRoleCount('recruiter')).toBe(1);
    expect(service.getRoleCount('unknown')).toBe(0);
  });

  it('loadPrompts() sets loadingPrompts false after resolve', async () => {
    await service.loadPrompts();
    expect(service.loadingPrompts()).toBe(false);
  });
});
