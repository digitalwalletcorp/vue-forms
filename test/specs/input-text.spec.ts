import { describe, it, expect } from 'vitest';
import { reactive } from 'vue';
import { mount } from '@vue/test-utils';
import InputText from '@/input-text.vue';
import { errorObserverKey } from '@/error-observer';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

type InputTextProps = InstanceType<typeof InputText>['$props'];

const mountInputText = (props: InputTextProps = {}, options: { attrs?: Record<string, unknown>, errorObserver?: ValidationError, attachTo?: HTMLElement } = {}) => {
  return mount(InputText, {
    props,
    attrs: options.attrs,
    attachTo: options.attachTo,
    global: {
      plugins: [createTestI18n()],
      provide: options.errorObserver ? { [errorObserverKey as symbol]: options.errorObserver } : {}
    }
  });
};

/** 入力欄に値を入れてinputイベントを起こし、emitされたupdate:modelValueの値を返す */
const typeValue = async (wrapper: ReturnType<typeof mountInputText>, value: string): Promise<unknown[] | undefined> => {
  await wrapper.find('input').setValue(value);
  return wrapper.emitted('update:modelValue')?.map(args => args[0]);
};

describe('InputText', () => {
  describe('root element', () => {
    it('renders a text input as the root', () => {
      const wrapper = mountInputText({ modelValue: 'abc' });
      expect(wrapper.element.tagName).toBe('INPUT');
      expect(wrapper.attributes('type')).toBe('text');
      expect(wrapper.classes()).toEqual(['dwui-input-text']);
      expect((wrapper.element as HTMLInputElement).value).toBe('abc');
    });

    it('passes attributes through to the input', () => {
      const wrapper = mountInputText({}, {
        attrs: {
          class: 'wide',
          style: 'margin: 1px;',
          maxlength: 10,
          placeholder: 'Name',
          disabled: true
        }
      });
      expect(wrapper.classes()).toEqual(['dwui-input-text', 'wide']);
      expect(wrapper.attributes('style')).toBe('margin: 1px;');
      expect(wrapper.attributes('maxlength')).toBe('10');
      expect(wrapper.attributes('placeholder')).toBe('Name');
      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('does not render vid as a DOM attribute', () => {
      const wrapper = mountInputText({ vid: 'name' });
      expect(wrapper.attributes('vid')).toBeUndefined();
    });
  });

  describe('error state', () => {
    it('adds the error class while the error observer has an error for the vid', async () => {
      const errorObserver = reactive<ValidationError>({});
      const wrapper = mountInputText({ vid: 'name' }, { errorObserver });
      expect(wrapper.classes()).not.toContain('dwui-error');

      errorObserver.name = [{ code: 'code.W001', bind: ['item.name'] }];
      await wrapper.vm.$nextTick();
      expect(wrapper.classes()).toContain('dwui-error');
    });

    it('looks up the indexed key', () => {
      const wrapper = mountInputText({ vid: 'rows', index: 1 }, { errorObserver: { 'rows[1]': [{ code: 'code.W001' }] } });
      expect(wrapper.classes()).toContain('dwui-error');
    });

    it('works without an error observer', () => {
      const wrapper = mountInputText({ vid: 'name' });
      expect(wrapper.classes()).not.toContain('dwui-error');
    });
  });

  describe('string model', () => {
    it('emits the input as a string', async () => {
      const wrapper = mountInputText();
      expect(await typeValue(wrapper, '123')).toEqual(['123']);
    });

    it('removes characters not allowed by allowType', async () => {
      const wrapper = mountInputText({ allowType: 'alpha' });
      expect(await typeValue(wrapper, 'ab1c')).toEqual(['abc']);
      expect((wrapper.element as HTMLInputElement).value).toBe('abc');
    });

    it('removes characters not allowed by allowRegexp', async () => {
      const wrapper = mountInputText({ allowRegexp: '^[a-c]*$' });
      expect(await typeValue(wrapper, 'abd')).toEqual(['ab']);
    });
  });

  describe('number model', () => {
    it('emits a number, and null for an empty input', async () => {
      const wrapper = mountInputText({ modelType: 'number' });
      expect(await typeValue(wrapper, '12.5')).toEqual([12.5]);
      expect(await typeValue(wrapper, '')).toEqual([12.5, null]);
    });

    it('drops characters that make the input not a number', async () => {
      const wrapper = mountInputText({ modelType: 'number' });
      expect(await typeValue(wrapper, '12a')).toEqual([12]);
      expect((wrapper.element as HTMLInputElement).value).toBe('12');
    });

    it('accepts a leading sign without emitting it until a number follows', async () => {
      const wrapper = mountInputText({ modelType: 'number' });
      expect(await typeValue(wrapper, '-')).toBeUndefined();
      expect((wrapper.element as HTMLInputElement).value).toBe('-');
      expect(await typeValue(wrapper, '-3')).toEqual([-3]);
    });

    it('accepts a leading sign with allowType decimal', async () => {
      const wrapper = mountInputText({ modelType: 'number', allowType: 'decimal' });
      expect(await typeValue(wrapper, '-1.5')).toEqual([-1.5]);
    });

    it('does not emit a sign followed by zeros until another digit follows', async () => {
      const wrapper = mountInputText({ modelType: 'number' });
      expect(await typeValue(wrapper, '+')).toBeUndefined();
      expect(await typeValue(wrapper, '-0')).toBeUndefined();
      expect(await typeValue(wrapper, '-0.0')).toBeUndefined();
      expect(await typeValue(wrapper, '-0.05')).toEqual([-0.05]);
    });

    it('clears the input when only a decimal point is typed', async () => {
      const wrapper = mountInputText({ modelType: 'number' });
      expect(await typeValue(wrapper, '.')).toEqual([null]);
      expect((wrapper.element as HTMLInputElement).value).toBe('');
    });

    it('keeps only the sign when a sign and a decimal point are typed', async () => {
      const wrapper = mountInputText({ modelType: 'number' });
      await typeValue(wrapper, '-.');
      expect((wrapper.element as HTMLInputElement).value).toBe('-');
    });

    it('emits null on blur when only a sign is left', async () => {
      const wrapper = mountInputText({ modelType: 'number' });
      await wrapper.find('input').setValue('-');
      await wrapper.trigger('blur');
      expect(wrapper.emitted('emit:blur')).toEqual([[null]]);
      expect((wrapper.element as HTMLInputElement).value).toBe('');
    });
  });

  describe('comma-digit model', () => {
    it('shows the initial value with commas', () => {
      const wrapper = mountInputText({ modelType: 'comma-digit', modelValue: 1234567 });
      expect((wrapper.element as HTMLInputElement).value).toBe('1,234,567');
    });

    it('removes commas on focus and adds them back on blur', async () => {
      const wrapper = mountInputText({ modelType: 'comma-digit', modelValue: 1234 });
      const input = wrapper.element as HTMLInputElement;
      await wrapper.trigger('focus');
      expect(input.value).toBe('1234');

      await wrapper.find('input').setValue('56789');
      await wrapper.trigger('blur');
      expect(input.value).toBe('56,789');
      expect(wrapper.emitted('emit:blur')).toEqual([[56789]]);
    });
  });

  describe('IME composition', () => {
    it('does not emit while composing, and emits the settled text on compositionend', async () => {
      const wrapper = mountInputText();
      const input = wrapper.find('input');
      await input.trigger('compositionstart');
      input.element.value = 'かな';
      await input.trigger('input');
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();

      await input.trigger('compositionend');
      expect(wrapper.emitted('update:modelValue')).toEqual([['かな']]);
    });

    it('filters the settled text by allowType', async () => {
      const wrapper = mountInputText({ allowType: 'number' });
      const input = wrapper.find('input');
      await input.trigger('compositionstart');
      input.element.value = '12あ';
      await input.trigger('compositionend');
      expect(wrapper.emitted('update:modelValue')).toEqual([['12']]);
    });
  });

  describe('events', () => {
    it('emits emit:enter with the current text on Enter', async () => {
      const wrapper = mountInputText();
      await wrapper.find('input').setValue('abc');
      await wrapper.trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('emit:enter')).toEqual([['abc']]);
    });
  });

  describe('expose', () => {
    it('getCurrentValue returns a number for comma-digit even while commas are shown', () => {
      const wrapper = mountInputText({ modelType: 'comma-digit', modelValue: 1234567 });
      expect(wrapper.vm.getCurrentValue()).toBe(1234567);
    });

    it('getCurrentValue returns null for an empty number input', () => {
      const wrapper = mountInputText({ modelType: 'number' });
      expect(wrapper.vm.getCurrentValue()).toBeNull();
    });

    it('setFocus focuses the input', () => {
      const wrapper = mountInputText({}, { attachTo: document.body });
      wrapper.vm.setFocus();
      expect(document.activeElement).toBe(wrapper.element);
      wrapper.unmount();
    });

    it('fireBlur emits emit:blur once with the value converted by modelType', async () => {
      const wrapper = mountInputText({ modelType: 'comma-digit' });
      await wrapper.find('input').setValue('1234');
      wrapper.vm.fireBlur();
      expect(wrapper.emitted('emit:blur')).toEqual([[1234]]);
      expect((wrapper.element as HTMLInputElement).value).toBe('1,234');
    });

    it('getInstance returns the input element', () => {
      const wrapper = mountInputText();
      expect(wrapper.vm.getInstance()).toBe(wrapper.element);
    });
  });
});
