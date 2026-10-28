import i18n from 'i18next';

/**
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

  // Check if item is a product object containing category fields
  const isProduct = Boolean(
    item.categoryName ||
    item.categoryNameLocal ||
    item.category ||
    item.categoryId != null ||
    item.category_id != null
  );

  let enName = '';
  let localName = '';

  if (isProduct) {
    // For a product object, strictly read the category fields, NEVER item.name (which is product name)
    enName = (
      item.categoryName ??
      item.category?.name ??
      ''
    ).trim();

    localName = (
      item.categoryNameLocal ??
      item.category_name_local ??
      item.category?.name_local ??
      item.category?.nameLocal ??
      ''
    ).trim();
  } else {
    // For a category object, read its direct name and name_local
    enName = (
      item.name ??
      ''
    ).trim();

    localName = (
      item.name_local ??
      item.nameLocal ??
      ''
    ).trim();
  }

  if (isKhmer) {
    return localName || enName || '';
  }

  return enName || localName || '';
}

export default getCategoryDisplayName;
