import { describe, it, expect, beforeEach, vi } from 'vitest';
import { defineComponent, h, nextTick, reactive, ref, toRef } from 'vue';
import type { Component, ComponentCustomProperties, Ref } from 'vue';
import { mount } from '@vue/test-utils';
import { useMemorizedValue } from '@/use-memorized-value';

const STORAGE_KEY = 'dwui-memorized-form-value';

/** useMemorizedValueを呼ぶだけのコンポーネントを作る */
const createPage = <T>(name: string, key: string, source: Ref<T>): Component => defineComponent({
  name,
  setup: () => {
    useMemorizedValue(key, source);
    return () => h('div');
  }
});

/** 親コンポーネントの中に置いたコンポーネントを作る */
const createParent = (name: string, child: Component): Component => defineComponent({
  name,
  setup: () => () => h(child)
});

/** $routeが登録されたアプリとして表示する */
const mountWithRoute = (component: Component, routePath?: string) => {
  const globalProperties: Record<string, unknown> = routePath == null
    ? {}
    : { $route: { matched: [{ path: '/' }, { path: routePath }] } };
  // テストでは$routeだけを登録する。vue-i18nなどが型に加えたプロパティは使わないため、型を合わせて渡す
  return mount(component, { global: { config: { globalProperties: globalProperties as unknown as ComponentCustomProperties } } });
};

const storedValues = (): Record<string, unknown> => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, unknown>;

describe('useMemorizedValue', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('memorizing and restoring', () => {
    it('restores the value saved last time when the page is shown again', async () => {
      const first = ref<string[]>([]);
      const firstPage = mountWithRoute(createPage('search-page', 'status', first), '/order');
      first.value = ['open'];
      await nextTick();
      firstPage.unmount();

      const second = ref<string[]>([]);
      mountWithRoute(createPage('search-page', 'status', second), '/order');
      expect(second.value).toEqual(['open']);
    });

    it('keeps the initial value when nothing is memorized', () => {
      const status = ref<string[]>(['closed']);
      mountWithRoute(createPage('search-page', 'status', status));
      expect(status.value).toEqual(['closed']);
    });

    it('restores a memorized null', async () => {
      const first = ref<string | null>('open');
      mountWithRoute(createPage('search-page', 'status', first)).unmount();
      const firstPage = mountWithRoute(createPage('search-page', 'status', first));
      first.value = null;
      await nextTick();
      firstPage.unmount();

      const second = ref<string | null>('open');
      mountWithRoute(createPage('search-page', 'status', second));
      expect(second.value).toBeNull();
    });

    it('saves changes made inside an array', async () => {
      const status = ref<string[]>([]);
      mountWithRoute(createPage('search-page', 'status', status));
      status.value.push('open');
      await nextTick();
      expect(Object.values(storedValues())).toEqual([['open']]);
    });

    it('does not save the restored value again', async () => {
      const first = ref<string[]>([]);
      const firstPage = mountWithRoute(createPage('search-page', 'status', first));
      first.value = ['open'];
      await nextTick();
      firstPage.unmount();

      const setItem = vi.spyOn(Storage.prototype, 'setItem');
      mountWithRoute(createPage('search-page', 'status', ref<string[]>([])));
      await nextTick();
      expect(setItem).not.toHaveBeenCalled();
    });

    it('works with a property of a reactive object through toRef', async () => {
      const first = reactive({ status: [] as string[] });
      const firstPage = mountWithRoute(createPage('search-page', 'status', toRef(first, 'status')));
      first.status = ['closed'];
      await nextTick();
      firstPage.unmount();

      const second = reactive({ status: [] as string[] });
      mountWithRoute(createPage('search-page', 'status', toRef(second, 'status')));
      expect(second.status).toEqual(['closed']);
    });

    it('stops saving after the page is unmounted', async () => {
      const status = ref<string[]>([]);
      mountWithRoute(createPage('search-page', 'status', status)).unmount();
      status.value = ['open'];
      await nextTick();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('scope of the memory', () => {
    it('shares the memory between routes that differ only in parameters', async () => {
      const first = ref<string[]>([]);
      const firstPage = mountWithRoute(createPage('detail-page', 'status', first), '/detail/:id');
      first.value = ['open'];
      await nextTick();
      firstPage.unmount();

      // /detail/123 と /detail/999 は同じルート定義 /detail/:id になる
      const second = ref<string[]>([]);
      mountWithRoute(createPage('detail-page', 'status', second), '/detail/:id');
      expect(second.value).toEqual(['open']);
    });

    it('separates the memory by the route definition', async () => {
      const first = ref<string[]>([]);
      const firstPage = mountWithRoute(createPage('index', 'status', first), '/order');
      first.value = ['open'];
      await nextTick();
      firstPage.unmount();

      // 別の画面の同じ名前(index)のコンポーネントでは復元しない
      const second = ref<string[]>([]);
      mountWithRoute(createPage('index', 'status', second), '/kyc/list');
      expect(second.value).toEqual([]);
    });

    it('separates the memory by the component on the same route', async () => {
      const first = ref<string[]>([]);
      const firstPage = mountWithRoute(createPage('order-search', 'status', first), '/order');
      first.value = ['open'];
      await nextTick();
      firstPage.unmount();

      // 同じルートに表示されるダイアログなど、別のコンポーネントでは復元しない
      const second = ref<string[]>([]);
      mountWithRoute(createPage('order-detail-modal', 'status', second), '/order');
      expect(second.value).toEqual([]);
    });

    it('separates the memory by the parents of the component', async () => {
      const first = ref<string[]>([]);
      const firstPage = mountWithRoute(createParent('page-a', createPage('status-filter', 'status', first)), '/order');
      first.value = ['open'];
      await nextTick();
      firstPage.unmount();

      const second = ref<string[]>([]);
      mountWithRoute(createParent('page-b', createPage('status-filter', 'status', second)), '/order');
      expect(second.value).toEqual([]);
    });

    it('separates the memory by the key in the same component', async () => {
      const status = ref<string[]>([]);
      const currency = ref<string[]>([]);
      const Page = defineComponent({
        name: 'search-page',
        setup: () => {
          useMemorizedValue('status', status);
          useMemorizedValue('currency', currency);
          return () => h('div');
        }
      });
      mountWithRoute(Page);
      status.value = ['open'];
      currency.value = ['JPY'];
      await nextTick();
      expect(Object.values(storedValues()).sort()).toEqual([['JPY'], ['open']]);
    });
  });

  describe('errors', () => {
    it('warns and does nothing when called outside setup', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const getItem = vi.spyOn(Storage.prototype, 'getItem');
      expect(() => useMemorizedValue('status', ref([]))).not.toThrow();
      expect(warn).toHaveBeenCalledWith('[vue-forms] useMemorizedValue must be called in setup. The value is not memorized.');
      expect(getItem).not.toHaveBeenCalled();
    });

    it('ignores broken stored data', () => {
      localStorage.setItem(STORAGE_KEY, '{broken');
      const status = ref<string[]>(['closed']);
      mountWithRoute(createPage('search-page', 'status', status));
      expect(status.value).toEqual(['closed']);
    });

    it('keeps working when localStorage throws', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied');
      });
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('denied');
      });
      const status = ref<string[]>(['closed']);
      mountWithRoute(createPage('search-page', 'status', status));
      expect(status.value).toEqual(['closed']);

      status.value = ['open'];
      await nextTick();
      expect(status.value).toEqual(['open']);
    });
  });
});
