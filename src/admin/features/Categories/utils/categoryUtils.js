import i18n from 'i18next';

/**
 * Returns the localized category display name based on the current or provided language.
 * - When language is Khmer ('km'), prioritizes `name_local` (falling back to `name`).
 * - When language is English ('en') or other, prioritizes `name` (falling back to `name_local`).
 *
 * Accepts either:
 * - A category object: `{ name, name_local }`
 * - A product object: `{ categoryName, categoryNameLocal, category: { ... } }`
 * - A plain string
 *
 * @param {Object|string} item - Category object, product object, or string
 * @param {string} [lang] - Optional language code (defaults to i18n active language)
 * @returns {string} Localized category display name
 */
export function getCategoryDisplayName(item, lang) {
  if (!item) return '';
  if (typeof item === 'string') return item;

  const currentLang = lang || i18n.resolvedLanguage || i18n.language || 'en';
  const isKhmer = typeof currentLang === 'string' && currentLang.startsWith('km');

  // Handle category object or product object with category info
  const enName = (
    item.name ??
    item.categoryName ??
    item.category?.name ??
    ''
  ).trim();

  const localName = (
    item.name_local ??
    item.nameLocal ??
    item.categoryNameLocal ??
    item.category?.name_local ??
    item.category?.nameLocal ??
    ''
  ).trim();

  if (isKhmer) {
    return localName || enName || '';
  }

  return enName || localName || '';
}

export default getCategoryDisplayName;
