export type Lang = 'ru' | 'en';

export interface Dictionary {
  nav_catalog: string; nav_categories: string; nav_about: string; nav_submit: string;
  search_placeholder_short: string; search_placeholder: string;
  favorites: string; account: string; add_prompt: string;
  hero_eyebrow: string; hero_title_1: string; hero_title_2: string; hero_title_3: string;
  hero_sub: string; hero_cta_primary: string; hero_cta_secondary: string;
  stat_prompts: string; stat_categories: string; stat_recruiters: string; stat_copies: string;
  section_categories: string; section_categories_sub: string;
  section_featured: string; section_featured_sub: string;
  section_by_role: string; section_by_role_sub: string;
  section_how: string; section_how_sub: string;
  card_uses: string; card_saves: string; card_updated: string; card_by: string;
  card_copy: string; card_open: string; card_save: string; card_saved: string;
  card_premium: string; card_free: string;
  level_basic: string; level_intermediate: string; level_advanced: string;
  detail_prompt: string; detail_variables: string; detail_example: string;
  detail_similar: string; detail_comments: string; detail_copied: string;
  detail_llm_compat: string; detail_why: string;
  filter_all: string; filter_category: string; filter_role: string; filter_industry: string;
  filter_llm: string; filter_level: string; filter_type: string; filter_sort: string;
  sort_popular: string; sort_recent: string; sort_rated: string;
  filter_clear: string; filter_show: string;
  search_results_for: string; search_no_results: string; search_try: string; search_suggestions: string;
  about_eyebrow: string; about_title: string; about_sub: string;
  about_mission_title: string; about_mission: string;
  about_how_title: string;
  about_how_1_t: string; about_how_1_d: string;
  about_how_2_t: string; about_how_2_d: string;
  about_how_3_t: string; about_how_3_d: string;
  fav_title: string; fav_empty_title: string; fav_empty_sub: string; fav_go: string;
  account_title: string; account_sub: string; my_prompts: string; my_history: string; my_subscription: string;
  submit_title: string; submit_sub: string;
  submit_name: string; submit_name_ph: string; submit_category: string;
  submit_roles: string; submit_industries: string; submit_llm: string; submit_level: string;
  submit_desc: string; submit_desc_ph: string;
  submit_prompt: string; submit_prompt_ph: string;
  submit_example: string; submit_example_ph: string;
  submit_submit: string; submit_draft: string;
  submit_tip_title: string; submit_tip_1: string; submit_tip_2: string; submit_tip_3: string; submit_tip_4: string;
  cat_title: string; cat_prompts: string;
  upgrade_title: string; upgrade_sub: string; upgrade_cta: string; upgrade_price: string;
  footer_tagline: string; footer_product: string; footer_company: string; footer_legal: string;
  footer_team: string; footer_contacts: string; footer_terms: string; footer_privacy: string;
  footer_license: string; footer_rights: string; footer_made: string;
  copy: string; copied: string; apply: string; cancel: string; close: string;
}

export const T: Record<Lang, Dictionary> = {
  ru: {
    nav_catalog: 'Каталог',
    nav_categories: 'Категории',
    nav_about: 'О проекте',
    nav_submit: 'Добавить',
    search_placeholder_short: 'Найти промпт...',
    search_placeholder: 'Поиск по промптам, ролям, категориям',
    favorites: 'Избранное',
    account: 'Кабинет',
    add_prompt: 'Добавить промпт',
    // Hero
    hero_eyebrow: 'БИБЛИОТЕКА ПРОМПТОВ ДЛЯ HR',
    hero_title_1: 'Лучшие промпты',
    hero_title_2: 'для рекрутеров',
    hero_title_3: 'промышленности.',
    hero_sub: 'Скрининг, вакансии, интервью и коммуникация — готовые промпты от практиков из Северстали, НЛМК, ТМК, СИБУРа и Газпром нефти. Проверено в бою.',
    hero_cta_primary: 'Открыть каталог',
    hero_cta_secondary: 'Смотреть пример',
    // Stats
    stat_prompts: 'проверенных промптов',
    stat_categories: 'категорий работы',
    stat_recruiters: 'рекрутеров используют',
    stat_copies: 'копирований за месяц',
    // Sections
    section_categories: 'Категории',
    section_categories_sub: 'Подбираем промпты под каждый этап воронки подбора',
    section_featured: 'Популярное сейчас',
    section_featured_sub: 'Самые копируемые промпты этой недели',
    section_by_role: 'По ролям',
    section_by_role_sub: 'Находите промпты под свой пул вакансий',
    section_how: 'Как пользоваться',
    section_how_sub: 'Три шага от проблемы до готового промпта',
    // Cards
    card_uses: 'копирований',
    card_saves: 'сохранений',
    card_updated: 'обновлён',
    card_by: 'от',
    card_copy: 'Скопировать',
    card_open: 'Открыть',
    card_save: 'В избранное',
    card_saved: 'В избранном',
    card_premium: 'Premium',
    card_free: 'Бесплатно',
    level_basic: 'Базовый',
    level_intermediate: 'Средний',
    level_advanced: 'Продвинутый',
    // Detail
    detail_prompt: 'Промпт',
    detail_variables: 'Переменные',
    detail_example: 'Пример результата',
    detail_similar: 'Похожие промпты',
    detail_comments: 'Отзывы рекрутеров',
    detail_copied: 'Скопировано в буфер обмена',
    detail_llm_compat: 'Совместимость с LLM',
    detail_why: 'Когда использовать',
    // Filters
    filter_all: 'Все',
    filter_category: 'Категория',
    filter_role: 'Роль',
    filter_industry: 'Отрасль',
    filter_llm: 'LLM',
    filter_level: 'Сложность',
    filter_type: 'Тип доступа',
    filter_sort: 'Сортировка',
    sort_popular: 'Популярные',
    sort_recent: 'Новые',
    sort_rated: 'С высоким рейтингом',
    filter_clear: 'Сбросить',
    filter_show: 'Показать результаты',
    // Search
    search_results_for: 'Результаты по запросу',
    search_no_results: 'Ничего не найдено',
    search_try: 'Попробуйте другие ключевые слова или сбросьте фильтры',
    search_suggestions: 'Попробуйте',
    // About
    about_eyebrow: 'О ПРОЕКТЕ',
    about_title: 'ИИ для тех, кто нанимает руками.',
    about_sub: 'Rengine AI — это библиотека промптов, собранных от HR-практиков на реальных промышленных предприятиях. Никакой воды, только то, что работает в цехе и на стройке.',
    about_mission_title: 'Зачем мы это делаем',
    about_mission: 'Рекрутинг в промышленности отличается от IT или ритейла: другая аудитория, другие каналы, другие критерии. Готовые промпты для маркетологов и продажников тут не работают. Мы собираем специализированные — от людей, которые закрывают 200 вакансий сварщиков в квартал.',
    about_how_title: 'Как работает библиотека',
    about_how_1_t: 'Выберите этап воронки',
    about_how_1_d: 'От составления вакансии до онбординга — промпты для каждого шага.',
    about_how_2_t: 'Подставьте переменные',
    about_how_2_d: 'Каждый промпт устроен как шаблон: вы только заполняете контекст своей компании.',
    about_how_3_t: 'Скопируйте в вашу LLM',
    about_how_3_d: 'Работает с GPT, Claude, YandexGPT, GigaChat — указано на каждой карточке.',
    // Favorites
    fav_title: 'Избранное',
    fav_empty_title: 'Пусто',
    fav_empty_sub: 'Нажмите на закладку на любом промпте, чтобы сохранить его сюда',
    fav_go: 'К каталогу',
    account_title: 'Мой кабинет',
    account_sub: 'Избранные промпты, история, подписка',
    my_prompts: 'Мои промпты',
    my_history: 'История использования',
    my_subscription: 'Подписка',
    // Submit form
    submit_title: 'Добавить свой промпт',
    submit_sub: 'Поделитесь рабочим промптом с сообществом. После модерации он появится в библиотеке.',
    submit_name: 'Название промпта',
    submit_name_ph: 'Например: Скрининг резюме сварщика НАКС',
    submit_category: 'Категория',
    submit_roles: 'Роли / специализации',
    submit_industries: 'Отрасли',
    submit_llm: 'Протестирован в LLM',
    submit_level: 'Уровень сложности',
    submit_desc: 'Краткое описание (что делает, когда использовать)',
    submit_desc_ph: 'Одно-два предложения, которые увидит пользователь в карточке',
    submit_prompt: 'Текст промпта',
    submit_prompt_ph: 'Полный текст. Используйте {{PLACEHOLDERS}} для переменных.',
    submit_example: 'Пример результата (опционально)',
    submit_example_ph: 'Короткий фрагмент того, что генерирует этот промпт',
    submit_submit: 'Отправить на модерацию',
    submit_draft: 'Сохранить черновик',
    submit_tip_title: 'Советы по хорошему промпту',
    submit_tip_1: 'Формулируйте роль ИИ в первой строке ("Ты — HR-специалист...")',
    submit_tip_2: 'Разделяйте требования на пронумерованные блоки',
    submit_tip_3: 'Описывайте формат ответа в конце промпта',
    submit_tip_4: 'Указывайте что НЕ делать — это часто важнее, чем что делать',
    // Category
    cat_title: 'Категория',
    cat_prompts: 'промптов в категории',
    // Pricing
    upgrade_title: 'Разблокируйте все Premium-промпты',
    upgrade_sub: 'Продвинутые промпты от HRD из Топ-100 промышленных компаний',
    upgrade_cta: 'Оформить подписку',
    upgrade_price: '990 ₽ / мес',
    // Footer
    footer_tagline: 'Библиотека промптов для рекрутинга в металлургии, нефтегазе, машиностроении и строительстве.',
    footer_product: 'Продукт',
    footer_company: 'Компания',
    footer_legal: 'Правовое',
    footer_team: 'Команда',
    footer_contacts: 'Контакты',
    footer_terms: 'Условия',
    footer_privacy: 'Конфиденциальность',
    footer_license: 'Лицензия',
    footer_rights: 'Все права защищены.',
    footer_made: 'Сделано HR-ами для HR-ов.',
    // Misc
    copy: 'Копировать',
    copied: 'Скопировано',
    apply: 'Применить',
    cancel: 'Отмена',
    close: 'Закрыть'
  },
  en: {
    nav_catalog: 'Catalog',
    nav_categories: 'Categories',
    nav_about: 'About',
    nav_submit: 'Submit',
    search_placeholder_short: 'Find a prompt...',
    search_placeholder: 'Search prompts, roles, categories',
    favorites: 'Favorites',
    account: 'Account',
    add_prompt: 'Add prompt',
    hero_eyebrow: 'PROMPT LIBRARY FOR HR',
    hero_title_1: 'Best prompts',
    hero_title_2: 'for industrial',
    hero_title_3: 'recruiters.',
    hero_sub: 'Screening, job descriptions, interviews, outreach — battle-tested prompts from recruiters at Severstal, NLMK, TMK, Sibur and Gazprom Neft.',
    hero_cta_primary: 'Browse catalog',
    hero_cta_secondary: 'See example',
    stat_prompts: 'curated prompts',
    stat_categories: 'work categories',
    stat_recruiters: 'recruiters using it',
    stat_copies: 'copies this month',
    section_categories: 'Categories',
    section_categories_sub: 'Prompts for every stage of the hiring funnel',
    section_featured: 'Popular now',
    section_featured_sub: 'Most-copied prompts this week',
    section_by_role: 'By role',
    section_by_role_sub: 'Find prompts for your specific blue-collar roles',
    section_how: 'How it works',
    section_how_sub: 'Three steps from a problem to a working prompt',
    card_uses: 'copies',
    card_saves: 'saves',
    card_updated: 'updated',
    card_by: 'by',
    card_copy: 'Copy',
    card_open: 'Open',
    card_save: 'Save',
    card_saved: 'Saved',
    card_premium: 'Premium',
    card_free: 'Free',
    level_basic: 'Basic',
    level_intermediate: 'Intermediate',
    level_advanced: 'Advanced',
    detail_prompt: 'Prompt',
    detail_variables: 'Variables',
    detail_example: 'Example output',
    detail_similar: 'Similar prompts',
    detail_comments: 'Recruiter reviews',
    detail_copied: 'Copied to clipboard',
    detail_llm_compat: 'LLM compatibility',
    detail_why: 'When to use',
    filter_all: 'All',
    filter_category: 'Category',
    filter_role: 'Role',
    filter_industry: 'Industry',
    filter_llm: 'LLM',
    filter_level: 'Difficulty',
    filter_type: 'Access',
    filter_sort: 'Sort',
    sort_popular: 'Popular',
    sort_recent: 'Recent',
    sort_rated: 'Top rated',
    filter_clear: 'Clear',
    filter_show: 'Show results',
    search_results_for: 'Results for',
    search_no_results: 'Nothing found',
    search_try: 'Try different keywords or clear filters',
    search_suggestions: 'Try',
    about_eyebrow: 'ABOUT',
    about_title: 'AI for people who hire with their hands.',
    about_sub: 'Rengine AI is a library of prompts collected from HR practitioners at real industrial enterprises. No fluff — just what works on the factory floor.',
    about_mission_title: 'Why we built it',
    about_mission: 'Industrial recruiting is nothing like tech or retail hiring: different audience, different channels, different criteria. Generic marketing prompts don\u2019t work here. We collect specialized ones \u2014 from people who close 200 welder roles per quarter.',
    about_how_title: 'How the library works',
    about_how_1_t: 'Pick your funnel stage',
    about_how_1_d: 'From JD writing to onboarding \u2014 prompts for every step.',
    about_how_2_t: 'Fill in the variables',
    about_how_2_d: 'Each prompt is a template: you only add your company context.',
    about_how_3_t: 'Paste into your LLM',
    about_how_3_d: 'Works with GPT, Claude, YandexGPT, GigaChat \u2014 marked on each card.',
    fav_title: 'Favorites',
    fav_empty_title: 'Nothing saved',
    fav_empty_sub: 'Tap the bookmark on any prompt to save it here',
    fav_go: 'Browse catalog',
    account_title: 'My account',
    account_sub: 'Saved prompts, history, subscription',
    my_prompts: 'My prompts',
    my_history: 'Usage history',
    my_subscription: 'Subscription',
    submit_title: 'Submit your prompt',
    submit_sub: 'Share a working prompt with the community. Moderated, then published.',
    submit_name: 'Prompt name',
    submit_name_ph: 'E.g. NAKS Welder Resume Screening',
    submit_category: 'Category',
    submit_roles: 'Roles',
    submit_industries: 'Industries',
    submit_llm: 'Tested on LLM',
    submit_level: 'Difficulty',
    submit_desc: 'Short description',
    submit_desc_ph: 'One-two sentences users will see in the card',
    submit_prompt: 'Prompt text',
    submit_prompt_ph: 'Full text. Use {{PLACEHOLDERS}} for variables.',
    submit_example: 'Example output (optional)',
    submit_example_ph: 'A short fragment of what this prompt generates',
    submit_submit: 'Send for moderation',
    submit_draft: 'Save draft',
    submit_tip_title: 'Good prompt checklist',
    submit_tip_1: 'State the AI\u2019s role in line 1 (\u201cYou are an HR specialist...\u201d)',
    submit_tip_2: 'Split requirements into numbered blocks',
    submit_tip_3: 'Describe the output format at the end',
    submit_tip_4: 'Include what NOT to do \u2014 often more important than what to do',
    cat_title: 'Category',
    cat_prompts: 'prompts in this category',
    upgrade_title: 'Unlock all Premium prompts',
    upgrade_sub: 'Advanced prompts from HRDs at Top-100 industrial companies',
    upgrade_cta: 'Subscribe',
    upgrade_price: '$12 / mo',
    footer_tagline: 'Prompt library for recruiting in metallurgy, oil & gas, manufacturing and construction.',
    footer_product: 'Product',
    footer_company: 'Company',
    footer_legal: 'Legal',
    footer_team: 'Team',
    footer_contacts: 'Contacts',
    footer_terms: 'Terms',
    footer_privacy: 'Privacy',
    footer_license: 'License',
    footer_rights: 'All rights reserved.',
    footer_made: 'Made by recruiters, for recruiters.',
    copy: 'Copy',
    copied: 'Copied',
    apply: 'Apply',
    cancel: 'Cancel',
    close: 'Close'
  }
};
