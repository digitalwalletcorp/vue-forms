import { describe, it, expect } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import InputNumber from '@/input-number.vue';
import { errorObserverKey } from '@/error-observer';
import { VueFormsError } from '@/errors';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

type InputNumberProps = InstanceType<typeof InputNumber>['$props'];

const mountInputNumber = (props: InputNumberProps = {}, options: { attrs?: Record<string, unknown>, errorObserver?: ValidationError, attachTo?: HTMLElement } = {}) => {
  return mount(InputNumber, {
    props,
    attrs: options.attrs,
    attachTo: options.attachTo,
    global: {
      plugins: [createTestI18n()],
      provide: options.errorObserver ? { [errorObserverKey as symbol]: options.errorObserver } : {}
    }
  });
};

const inputElement = (wrapper: ReturnType<typeof mountInputNumber>): HTMLInputElement => wrapper.element as HTMLInputElement;

/** 入力欄に値を入れてblurし、emitされたemit:blurの値を返す */
const typeAndBlur = async (wrapper: ReturnType<typeof mountInputNumber>, value: string): Promise<unknown[] | undefined> => {
  await wrapper.find('input').setValue(value);
  await wrapper.trigger('blur');
  return wrapper.emitted('emit:blur')?.map(args => args[0]);
};

describe('InputNumber', () => {
  describe('root element', () => {
    it('renders a number input as the root', () => {
      const wrapper = mountInputNumber({ modelValue: 12 });
      expect(wrapper.element.tagName).toBe('INPUT');
      expect(wrapper.attributes('type')).toBe('number');
      expect(wrapper.classes()).toEqual(['dwui-input-number']);
      expect(inputElement(wrapper).value).toBe('12');
    });

    it('passes attributes through to the input', () => {
      const wrapper = mountInputNumber({
        min: 0,
        max: 10
      }, {
        attrs: {
          class: 'wide',
          step: 0.5,
          placeholder: 'Amount',
          readonly: true
        }
      });
      expect(wrapper.classes()).toEqual(['dwui-input-number', 'wide']);
      expect(wrapper.attributes('min')).toBe('0');
      expect(wrapper.attributes('max')).toBe('10');
      expect(wrapper.attributes('step')).toBe('0.5');
      expect(wrapper.attributes('placeholder')).toBe('Amount');
      expect(wrapper.attributes('readonly')).toBeDefined();
    });

    it('does not render vid as a DOM attribute', () => {
      const wrapper = mountInputNumber({ vid: 'amount' });
      expect(wrapper.attributes('vid')).toBeUndefined();
    });
  });

  describe('blur', () => {
    it('emits the number on blur, not on input', async () => {
      const wrapper = mountInputNumber();
      await wrapper.find('input').setValue('12.5');
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();

      await wrapper.trigger('blur');
      expect(wrapper.emitted('update:modelValue')).toEqual([[12.5]]);
      expect(wrapper.emitted('emit:blur')).toEqual([[12.5]]);
    });

    it('emits null for an empty input', async () => {
      const wrapper = mountInputNumber({ modelValue: 3 });
      expect(await typeAndBlur(wrapper, '')).toEqual([null]);
    });

    it('clamps the value to min and max', async () => {
      const wrapper = mountInputNumber({
        min: 1,
        max: 10
      });
      expect(await typeAndBlur(wrapper, '20')).toEqual([10]);
      expect(await typeAndBlur(wrapper, '-5')).toEqual([10, 1]);
    });

    it('writes the clamped value back when it equals the current modelValue', async () => {
      const wrapper = mountInputNumber({
        modelValue: 10,
        max: 10
      });
      await typeAndBlur(wrapper, '20');
      expect(inputElement(wrapper).value).toBe('10');
    });
  });

  describe('scale', () => {
    it('truncates digits after the decimal point beyond the scale', async () => {
      const wrapper = mountInputNumber({ scale: 2 });
      await wrapper.find('input').setValue('1.2345');
      expect(inputElement(wrapper).value).toBe('1.23');
    });

    it('blocks the decimal point when the scale is 0', async () => {
      const wrapper = mountInputNumber({ scale: 0 });
      const event = new KeyboardEvent('keydown', {
        key: '.',
        cancelable: true
      });
      wrapper.element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('throws VueFormsError for a negative scale', () => {
      expect(() => mountInputNumber({ scale: -1 })).toThrow(VueFormsError);
    });
  });

  describe('keydown', () => {
    it.each(['e', 'E'])('blocks the exponent character %s', (key) => {
      const wrapper = mountInputNumber();
      const event = new KeyboardEvent('keydown', {
        key,
        cancelable: true
      });
      wrapper.element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('emits emit:enter with the number on Enter', async () => {
      const wrapper = mountInputNumber();
      await wrapper.find('input').setValue('7');
      await wrapper.trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('emit:enter')).toEqual([[7]]);
    });

    it('emits null with emit:enter for an empty input', async () => {
      const wrapper = mountInputNumber();
      await wrapper.trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('emit:enter')).toEqual([[null]]);
    });
  });

  describe('error state', () => {
    it('adds the error class while the error observer has an error for the vid', async () => {
      const errorObserver = reactive<ValidationError>({});
      const wrapper = mountInputNumber({ vid: 'amount' }, { errorObserver });
      expect(wrapper.classes()).not.toContain('dwui-error');

      errorObserver.amount = [{ code: 'code.W001' }];
      await nextTick();
      expect(wrapper.classes()).toContain('dwui-error');
    });
  });

  describe('expose', () => {
    it('getCurrentValue returns null for an empty input', () => {
      const wrapper = mountInputNumber();
      expect(wrapper.vm.getCurrentValue()).toBeNull();
    });

    it('getCurrentValue returns the number of the input', () => {
      const wrapper = mountInputNumber({ modelValue: 42 });
      expect(wrapper.vm.getCurrentValue()).toBe(42);
    });

    it('fireBlur clamps the value and emits update:modelValue and emit:blur', async () => {
      const wrapper = mountInputNumber({ max: 5 });
      await wrapper.find('input').setValue('9');
      wrapper.vm.fireBlur();
      expect(wrapper.emitted('update:modelValue')).toEqual([[5]]);
      expect(wrapper.emitted('emit:blur')).toEqual([[5]]);
    });

    it('setFocus focuses the input', () => {
      const wrapper = mountInputNumber({}, { attachTo: document.body });
      wrapper.vm.setFocus();
      expect(document.activeElement).toBe(wrapper.element);
      wrapper.unmount();
    });
  });
});
