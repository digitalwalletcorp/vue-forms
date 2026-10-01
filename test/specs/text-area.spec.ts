import { describe, it, expect } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import TextArea from '@/text-area.vue';
import { errorObserverKey } from '@/error-observer';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

type TextAreaProps = InstanceType<typeof TextArea>['$props'];

const mountTextArea = (props: TextAreaProps = {}, options: { attrs?: Record<string, unknown>, errorObserver?: ValidationError, attachTo?: HTMLElement } = {}) => {
  return mount(TextArea, {
    props,
    attrs: options.attrs,
    attachTo: options.attachTo,
    global: {
      plugins: [createTestI18n()],
      provide: options.errorObserver ? { [errorObserverKey as symbol]: options.errorObserver } : {}
    }
  });
};

const textAreaElement = (wrapper: ReturnType<typeof mountTextArea>): HTMLTextAreaElement => wrapper.element as HTMLTextAreaElement;

describe('TextArea', () => {
  describe('root element', () => {
    it('renders a textarea as the root', () => {
      const wrapper = mountTextArea({ modelValue: 'line1\nline2' });
      expect(wrapper.element.tagName).toBe('TEXTAREA');
      expect(wrapper.classes()).toEqual(['dwui-text-area']);
      expect(textAreaElement(wrapper).value).toBe('line1\nline2');
    });

    it('shows an empty text for null', () => {
      const wrapper = mountTextArea({ modelValue: null });
      expect(textAreaElement(wrapper).value).toBe('');
    });

    it('passes attributes through to the textarea', () => {
      const wrapper = mountTextArea({ maxlength: 100 }, {
        attrs: {
          class: 'wide',
          rows: 4,
          cols: 50,
          autocomplete: 'off',
          placeholder: 'Memo',
          disabled: true
        }
      });
      expect(wrapper.classes()).toEqual(['dwui-text-area', 'wide']);
      expect(wrapper.attributes('maxlength')).toBe('100');
      expect(wrapper.attributes('rows')).toBe('4');
      expect(wrapper.attributes('cols')).toBe('50');
      expect(wrapper.attributes('autocomplete')).toBe('off');
      expect(wrapper.attributes('placeholder')).toBe('Memo');
      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('does not render vid as a DOM attribute', () => {
      const wrapper = mountTextArea({ vid: 'memo' });
      expect(wrapper.attributes('vid')).toBeUndefined();
    });
  });

  describe('input', () => {
    it('emits the text including line breaks', async () => {
      const wrapper = mountTextArea();
      await wrapper.find('textarea').setValue('a\nb');
      expect(wrapper.emitted('update:modelValue')).toEqual([['a\nb']]);
    });

    it('removes characters not allowed by allowType', async () => {
      const wrapper = mountTextArea({ allowType: 'alpha' });
      await wrapper.find('textarea').setValue('ab1c');
      expect(wrapper.emitted('update:modelValue')).toEqual([['abc']]);
      expect(textAreaElement(wrapper).value).toBe('abc');
    });

    it('removes characters not allowed by allowRegexp', async () => {
      const wrapper = mountTextArea({ allowRegexp: '^[a-c\\n]*$' });
      await wrapper.find('textarea').setValue('ab\nd');
      expect(wrapper.emitted('update:modelValue')).toEqual([['ab\n']]);
    });

    it('emits emit:blur with the text', async () => {
      const wrapper = mountTextArea();
      await wrapper.find('textarea').setValue('memo');
      await wrapper.trigger('blur');
      expect(wrapper.emitted('emit:blur')).toEqual([['memo']]);
    });
  });

  describe('maximum length', () => {
    it('adds the maximum-length class when the length reaches maxlength', async () => {
      const wrapper = mountTextArea({
        modelValue: 'abc',
        maxlength: 4
      });
      expect(wrapper.classes()).not.toContain('dwui-maximum-length');
      await wrapper.setProps({ modelValue: 'abcd' });
      expect(wrapper.classes()).toContain('dwui-maximum-length');
    });

    it('adds the maximum-length class when the length exceeds alertMaxlength', async () => {
      const wrapper = mountTextArea({
        modelValue: 'abc',
        alertMaxlength: 3
      });
      expect(wrapper.classes()).not.toContain('dwui-maximum-length');
      await wrapper.setProps({ modelValue: 'abcd' });
      expect(wrapper.classes()).toContain('dwui-maximum-length');
    });
  });

  describe('error state', () => {
    it('adds the error class while the error observer has an error for the vid', async () => {
      const errorObserver = reactive<ValidationError>({});
      const wrapper = mountTextArea({ vid: 'memo' }, { errorObserver });
      expect(wrapper.classes()).not.toContain('dwui-error');

      errorObserver.memo = [{ code: 'code.W001' }];
      await nextTick();
      expect(wrapper.classes()).toContain('dwui-error');
    });
  });

  describe('expose', () => {
    it('getCurrentValue returns the text of the textarea', () => {
      const wrapper = mountTextArea({ modelValue: 'a\nb' });
      expect(wrapper.vm.getCurrentValue()).toBe('a\nb');
    });

    it('getCurrentValue returns an empty string for null', () => {
      const wrapper = mountTextArea({ modelValue: null });
      expect(wrapper.vm.getCurrentValue()).toBe('');
    });

    it('fireBlur emits emit:blur with the text of the textarea', () => {
      const wrapper = mountTextArea({ modelValue: 'memo' });
      wrapper.vm.fireBlur();
      expect(wrapper.emitted('emit:blur')).toEqual([['memo']]);
    });

    it('setFocus focuses the textarea', () => {
      const wrapper = mountTextArea({}, { attachTo: document.body });
      wrapper.vm.setFocus();
      expect(document.activeElement).toBe(wrapper.element);
      wrapper.unmount();
    });
  });
});
