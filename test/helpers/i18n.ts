import { createI18n } from 'vue-i18n';

/** テスト用のi18n。アプリと同じくComposition APIモード(legacy: false)で作る */
export const createTestI18n = () => createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      'code.W001': '{0} is required',
      'code.W002': 'Row {0} is invalid',
      'item.name': 'Name',
      'item.first': 'First',
      'item.second': 'Second',
      'item.apple': 'Apple',
      'item.banana': 'Banana',
      'item.none': 'None',
      'dwui.input-date.invalid-date': 'invalid date',
      'dwui.input-date.invalid-time': 'invalid time',
      'dwui.input-date.invalid-format': 'invalid format'
    }
  }
});
