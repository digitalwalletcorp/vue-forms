import { describe, it, expect } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import InputPassword from '@/input-password.vue';
import { errorObserverKey } from '@/error-observer';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

type InputPasswordProps = InstanceType<typeof InputPassword>['$props'];

const mountInputPassword = (props: InputPasswordProps = {}, options: { attrs?: Record<string, unknown>, errorObserver?: ValidationError } = {}) => {
  return mount(InputPassword, {
    props,
    attrs: options.attrs,
    global: {
      plugins: [createTestI18n()],
      provide: options.errorObserver ? { [errorObserverKey as symbol]: options.errorObserver } : {}
    }
  });
};

describe('InputPassword', () => {
  describe('root element', () => {
    it('renders a password input as the root', () => {
      const wrapper = mountInputPassword({ modelValue: 'secret' });
      expect(wrapper.element.tagName).toBe('INPUT');
      expect(wrapper.attributes('type')).toBe('password');
      expect(wrapper.classes()).toEqual(['dwui-input-password']);
      expect((wrapper.element as HTMLInputElement).value).toBe('secret');
    });

    it('passes attributes through to the input', () => {
      const wrapper = mountInputPassword({}, {
        attrs: {
          class: 'wide',
          autocomplete: 'new-password',
          maxlength: 20,
          readonly: true
        }
      });
      expect(wrapper.classes()).toEqual(['dwui-input-password', 'wide']);
      expect(wrapper.attributes('autocomplete')).toBe('new-password');
      expect(wrapper.attributes('maxlength')).toBe('20');
      expect(wrapper.attributes('readonly')).toBeDefined();
    });

    it('does not render vid as a DOM attribute', () => {
      const wrapper = mountInputPassword({ vid: 'password' });
      expect(wrapper.attributes('vid')).toBeUndefined();
    });
  });

  describe('input', () => {
    it('emits the input as it is', async () => {
      const wrapper = mountInputPassword();
      await wrapper.find('input').setValue('p@ss');
      expect(wrapper.emitted('update:modelValue')).toEqual([['p@ss']]);
    });

    it('removes characters not allowed by allowType', async () => {
      const wrapper = mountInputPassword({ allowType: 'alphanum' });
      await wrapper.find('input').setValue('ab!1');
      expect(wrapper.emitted('update:modelValue')).toEqual([['ab1']]);
      expect((wrapper.element as HTMLInputElement).value).toBe('ab1');
    });

    it('removes characters not allowed by allowRegexp', async () => {
      const wrapper = mountInputPassword({ allowRegexp: '^[a-c]*$' });
      await wrapper.find('input').setValue('abd');
      expect(wrapper.emitted('update:modelValue')).toEqual([['ab']]);
    });
  });

  describe('events', () => {
    it('emits emit:blur with the current text', async () => {
      const wrapper = mountInputPassword();
      await wrapper.find('input').setValue('abc');
      await wrapper.trigger('blur');
      expect(wrapper.emitted('emit:blur')).toEqual([['abc']]);
    });

    it('emits emit:enter with the current text on Enter', async () => {
      const wrapper = mountInputPassword();
      await wrapper.find('input').setValue('abc');
      await wrapper.trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('emit:enter')).toEqual([['abc']]);
    });
  });

  describe('error state', () => {
    it('adds the error class while the error observer has an error for the vid', async () => {
      const errorObserver = reactive<ValidationError>({});
      const wrapper = mountInputPassword({ vid: 'password' }, { errorObserver });
      expect(wrapper.classes()).not.toContain('dwui-error');

      errorObserver.password = [{ code: 'code.W001' }];
      await nextTick();
      expect(wrapper.classes()).toContain('dwui-error');
    });
  });

  describe('expose', () => {
    it('getCurrentValue returns the text of the input', () => {
      const wrapper = mountInputPassword({ modelValue: 'secret' });
      expect(wrapper.vm.getCurrentValue()).toBe('secret');
    });

    it('fireBlur emits emit:blur with the text of the input', () => {
      const wrapper = mountInputPassword({ modelValue: 'secret' });
      wrapper.vm.fireBlur();
      expect(wrapper.emitted('emit:blur')).toEqual([['secret']]);
    });
  });
});
