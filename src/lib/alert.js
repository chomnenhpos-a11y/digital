import SweetAlert from 'sweetalert2';
import i18n from '../i18n';

// Resolve translations when each alert opens so language changes apply immediately.
export default class Alert extends SweetAlert {
  static fire(...args) {
    const options = SweetAlert.argsToParams(args);
    const language = i18n.resolvedLanguage || i18n.language || 'en';

    return super.fire({
      confirmButtonText: i18n.t('common.ok'),
      cancelButtonText: i18n.t('common.cancel'),
      ...options,
      ...(language.split('-')[0] === 'km'
        ? { confirmButtonText: i18n.t('common.ok') }
        : {}),
    });
  }
}
