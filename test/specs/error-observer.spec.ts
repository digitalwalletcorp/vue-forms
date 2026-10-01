import { describe, it, expect } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { errorObserverKey, hasInputError, tooltip, useErrorObserver, useInputError } from '@/error-observer';
import { doValidate } from '@/validation';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

/** tooltip()はuseI18n()を使うため、コンポーネントの描画中に呼んで結果を得る */
const renderTooltip = (errorObserver: ValidationError, key: string, index?: number): string => {
  const Probe = defineComponent({
    setup: () => () => h('span', tooltip(errorObserver, key, index))
  });
  return mount(Probe, { global: { plugins: [createTestI18n()] } }).text();
};

describe('error-observer', () => {
  describe('hasInputError', () => {
    it('finds the error by the key or the indexed key', () => {
      const errors: ValidationError = {
        'name': [{ code: 'code.W001' }],
        'rows[1]': [{ code: 'code.W002' }]
      };
      expect(hasInputError(errors, 'name')).toBe(true);
      expect(hasInputError(errors, 'rows', 1)).toBe(true);
      expect(hasInputError(errors, 'rows', 0)).toBe(false);
    });

    it('returns false without an error observer or a key', () => {
      expect(hasInputError(undefined, 'name')).toBe(false);
      expect(hasInputError({ name: [{ code: 'code.W001' }] }, undefined)).toBe(false);
    });
  });

  describe('tooltip', () => {
    it('translates the message and its bind parameters', () => {
      expect(renderTooltip({ name: [{ code: 'code.W001', bind: ['item.name'] }] }, 'name')).toBe('Name is required');
    });

    it('replaces $index with the 1-based index', () => {
      expect(renderTooltip({ 'rows[2]': [{ code: 'code.W002', bind: ['$index'] }] }, 'rows', 2)).toBe('Row 3 is invalid');
    });

    it('picks the bind parameter of the index from an array', () => {
      const errors: ValidationError = { 'rows[1]': [{ code: 'code.W001', bind: [['item.first', 'item.second']] }] };
      expect(renderTooltip(errors, 'rows', 1)).toBe('Second is required');
    });

    it('joins multiple messages with a comma', () => {
      const errors: ValidationError = {
        name: [
          { code: 'code.W001', bind: ['item.name'] },
          { code: 'code.W001', bind: ['item.first'] }
        ]
      };
      expect(renderTooltip(errors, 'name')).toBe('Name is required, First is required');
    });

    it('returns an empty string when there is no error', () => {
      expect(renderTooltip({}, 'name')).toBe('');
    });
  });

  describe('useErrorObserver / useInputError', () => {
    /** 親がuseErrorObserver()でprovideし、子がuseInputError()で受け取る */
    const Child = defineComponent({
      props: {
        vid: String,
        index: Number
      },
      setup: (props) => {
        const { hasError, message } = useInputError(() => props.vid, () => props.index);
        return () => h('span', { class: { error: hasError.value } }, message.value);
      }
    });

    it('shows the errors stored by doValidate through the provided observer', async () => {
      let errorObserver: ValidationError | undefined;
      const Parent = defineComponent({
        setup: () => {
          errorObserver = useErrorObserver();
          return () => h(Child, { vid: 'name' });
        }
      });
      const wrapper = mount(Parent, { global: { plugins: [createTestI18n()] } });
      expect(wrapper.find('span').classes()).not.toContain('error');
      expect(wrapper.text()).toBe('');

      doValidate(errorObserver, { name: [{ rule: true, code: 'code.W001', bind: ['item.name'] }] });
      await nextTick();
      expect(wrapper.find('span').classes()).toContain('error');
      expect(wrapper.text()).toBe('Name is required');

      doValidate(errorObserver, { name: [{ rule: false, code: 'code.W001', bind: ['item.name'] }] });
      await nextTick();
      expect(wrapper.find('span').classes()).not.toContain('error');
    });

    it('follows the key and the index when they change', async () => {
      const errorObserver: ValidationError = { 'rows[1]': [{ code: 'code.W002', bind: ['$index'] }] };
      const index = ref(0);
      const Parent = defineComponent({
        setup: () => () => h(Child, { vid: 'rows', index: index.value })
      });
      const wrapper = mount(Parent, {
        global: {
          plugins: [createTestI18n()],
          provide: { [errorObserverKey as symbol]: errorObserver }
        }
      });
      expect(wrapper.text()).toBe('');
      index.value = 1;
      await nextTick();
      expect(wrapper.text()).toBe('Row 2 is invalid');
    });

    it('reports no error when nothing is provided', () => {
      const wrapper = mount(Child, {
        props: { vid: 'name' },
        global: { plugins: [createTestI18n()] }
      });
      expect(wrapper.find('span').classes()).not.toContain('error');
      expect(wrapper.text()).toBe('');
    });
  });
});
