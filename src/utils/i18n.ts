import config from 'virtual:vela/config'

export type VelaTextKey =
  | 'search'
  | 'searchPlaceholder'
  | 'noResults'
  | 'previous'
  | 'next'
  | 'editPage'
  | 'updated'
  | 'version'
  | 'copy'
  | 'copied'

export type VelaI18nMessages = Record<VelaTextKey, string>

const dictionary: Record<string, VelaI18nMessages> = {
  en: {
    search: 'Search',
    searchPlaceholder: 'Search docs',
    noResults: 'No results',
    previous: 'Previous',
    next: 'Next',
    editPage: 'Edit this page',
    updated: 'Updated',
    version: 'Version',
    copy: 'Copy',
    copied: 'Copied',
  },
  zh: {
    search: '搜索',
    searchPlaceholder: '搜索文档',
    noResults: '没有结果',
    previous: '上一页',
    next: '下一页',
    editPage: '编辑此页',
    updated: '更新于',
    version: '版本',
    copy: '复制',
    copied: '已复制',
  },
  ja: {
    search: '検索',
    searchPlaceholder: 'ドキュメントを検索',
    noResults: '結果がありません',
    previous: '前へ',
    next: '次へ',
    editPage: 'このページを編集',
    updated: '更新日',
    version: 'バージョン',
    copy: 'コピー',
    copied: 'コピー済み',
  },
  ko: {
    search: '검색',
    searchPlaceholder: '문서 검색',
    noResults: '결과 없음',
    previous: '이전',
    next: '다음',
    editPage: '이 페이지 편집',
    updated: '업데이트',
    version: '버전',
    copy: '복사',
    copied: '복사됨',
  },
  fr: {
    search: 'Rechercher',
    searchPlaceholder: 'Rechercher dans la documentation',
    noResults: 'Aucun résultat',
    previous: 'Précédent',
    next: 'Suivant',
    editPage: 'Modifier cette page',
    updated: 'Mis à jour',
    version: 'Version',
    copy: 'Copier',
    copied: 'Copié',
  },
  de: {
    search: 'Suchen',
    searchPlaceholder: 'Dokumentation durchsuchen',
    noResults: 'Keine Ergebnisse',
    previous: 'Zurück',
    next: 'Weiter',
    editPage: 'Diese Seite bearbeiten',
    updated: 'Aktualisiert',
    version: 'Version',
    copy: 'Kopieren',
    copied: 'Kopiert',
  },
  es: {
    search: 'Buscar',
    searchPlaceholder: 'Buscar en la documentación',
    noResults: 'Sin resultados',
    previous: 'Anterior',
    next: 'Siguiente',
    editPage: 'Editar esta página',
    updated: 'Actualizado',
    version: 'Versión',
    copy: 'Copiar',
    copied: 'Copiado',
  },
  pt: {
    search: 'Pesquisar',
    searchPlaceholder: 'Pesquisar na documentação',
    noResults: 'Nenhum resultado',
    previous: 'Anterior',
    next: 'Próximo',
    editPage: 'Editar esta página',
    updated: 'Atualizado',
    version: 'Versão',
    copy: 'Copiar',
    copied: 'Copiado',
  },
  ru: {
    search: 'Поиск',
    searchPlaceholder: 'Поиск по документации',
    noResults: 'Ничего не найдено',
    previous: 'Назад',
    next: 'Далее',
    editPage: 'Редактировать страницу',
    updated: 'Обновлено',
    version: 'Версия',
    copy: 'Копировать',
    copied: 'Скопировано',
  },
  it: {
    search: 'Cerca',
    searchPlaceholder: 'Cerca nella documentazione',
    noResults: 'Nessun risultato',
    previous: 'Precedente',
    next: 'Successivo',
    editPage: 'Modifica questa pagina',
    updated: 'Aggiornato',
    version: 'Versione',
    copy: 'Copia',
    copied: 'Copiato',
  },
  ar: {
    search: 'بحث',
    searchPlaceholder: 'ابحث في الوثائق',
    noResults: 'لا توجد نتائج',
    previous: 'السابق',
    next: 'التالي',
    editPage: 'عدّل هذه الصفحة',
    updated: 'آخر تحديث',
    version: 'الإصدار',
    copy: 'نسخ',
    copied: 'تم النسخ',
  },
}

export function text(key: VelaTextKey, lang?: string): string {
  const locale = normalizeLocale(lang)
  const fallback = fallbackLocale(locale)
  return config.i18n?.[locale]?.[key]
    || config.i18n?.[fallback]?.[key]
    || dictionary[locale]?.[key]
    || dictionary[fallback]?.[key]
    || dictionary.en[key]
}

export function translated(value: { translations?: Record<string, string>; label?: string } | undefined, lang?: string): string | undefined {
  if (!value) return undefined
  const locale = normalizeLocale(lang)
  return value.translations?.[lang || ''] || value.translations?.[locale] || value.translations?.[fallbackLocale(locale)] || value.label
}

export function searchPlaceholder(lang?: string): string {
  const search = config.search
  if (typeof search === 'object') {
    const locale = normalizeLocale(lang)
    return search.translations?.[lang || ''] || search.translations?.[locale] || search.translations?.[fallbackLocale(locale)] || search.placeholder || text('searchPlaceholder', lang)
  }
  return text('searchPlaceholder', lang)
}

function normalizeLocale(lang?: string): string {
  const lower = (lang || 'en').toLowerCase()
  if (lower.startsWith('zh')) return 'zh'
  if (lower.startsWith('pt')) return 'pt'
  if (lower.startsWith('en')) return 'en'
  return lower.split(/[-_]/)[0] || 'en'
}

function fallbackLocale(locale: string): string {
  return dictionary[locale] ? locale : 'en'
}
