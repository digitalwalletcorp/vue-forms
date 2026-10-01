import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import FloatingVue from 'floating-vue';
import 'floating-vue/style.css';
import '@digitalwalletcorp/vue-svg-icons/style.css';
import { messages } from './messages';
import Catalog from './catalog.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages
});

createApp(Catalog).use(i18n).use(FloatingVue).mount('#app');
