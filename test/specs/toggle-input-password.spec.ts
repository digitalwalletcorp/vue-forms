import { describe, it, expect } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import ToggleInputPassword from '@/toggle-input-password.vue';
import { errorObserverKey } from '@/error-observer';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

type ToggleInputPasswordProps = InstanceType<typeof ToggleInputPassword>['$props'];

const mountToggle = (props: ToggleInputPasswordProps = {}, options: { attrs?: Record<string, unknown>, errorObserver?: ValidationError, slots?: Record<string, string>, attachTo?: HTMLElement } = {}) => {
  return mount(ToggleInputPassword, {
    props,
    attrs: options.attrs,
    slots: options.slots,
    attachTo: options.attachTo,
    global: {
      plugins: [createTestI18n()],
      provide: options.errorObserver ? { [errorObserverKey as symbol]: options.errorObserver } : {}
    }
  });
};

const toggleButton = (wrapper: ReturnType<typeof mountToggle>) => wrapper.find('.dwui-toggle-input-password-toggle');
const createButton = (wrapper: ReturnType<typeof mountToggle>) => wrapper.find('.dwui-toggle-input-password-create');

describe('ToggleInputPassword', () => {
  describe('root element', () => {
    it('renders a div container with a password input, the toggle button and the create button', () => {
      const wrapper = mountToggle({ modelValue: 'secret' });
      expect(wrapper.element.tagName).toBe('DIV');
      expect(wrapper.classes()).toEqual(['dwui-toggle-input-password']);
      expect(wrapper.find('input').attributes('type')).toBe('password');
      expect(wrapper.find('input').attributes('autocomplete')).toBe('new-password');
      expect((wrapper.find('input').element as HTMLInputElement).value).toBe('secret');
      expect(toggleButton(wrapper).attributes('type')).toBe('button');
      expect(createButton(wrapper).text()).toBe('CREATE');
    });

    it('passes attributes through to the container', () => {
      const wrapper = mountToggle({}, {
        attrs: {
          class: 'ml4',
          style: 'margin: 1px;'
        }
      });
      expect(wrapper.classes()).toEqual(['dwui-toggle-input-password', 'ml4']);
      expect(wrapper.attributes('style')).toBe('margin: 1px;');
    });

    it('puts the input attributes and parts props on the input and the create button', () => {
      const wrapper = mountToggle({
        id: 'password',
        name: 'password',
        placeholder: 'Password',
        maxlength: 20,
        inputClass: 'wide',
        inputStyle: { margin: '2px' },
        buttonClass: 'btn',
        buttonStyle: { color: 'red' }
      });
      const input = wrapper.find('input');
      expect(input.attributes('id')).toBe('password');
      expect(input.attributes('name')).toBe('password');
      expect(input.attributes('placeholder')).toBe('Password');
      expect(input.attributes('maxlength')).toBe('20');
      expect(input.classes()).toContain('wide');
      expect(input.attributes('style')).toBe('margin: 2px;');
      expect(createButton(wrapper).classes()).toContain('btn');
      expect(createButton(wrapper).attributes('style')).toBe('color: red;');
    });

    it('replaces the create button label with the slot', () => {
      const wrapper = mountToggle({}, { slots: { create: '<b>New</b>' } });
      expect(createButton(wrapper).html()).toContain('<b>New</b>');
    });

    it('hides the create button with visibleCreateButton false', () => {
      const wrapper = mountToggle({ visibleCreateButton: false });
      expect(createButton(wrapper).exists()).toBe(false);
    });
  });

  describe('toggling', () => {
    it('shows the password as text and hides it again', async () => {
      const wrapper = mountToggle({ modelValue: 'secret' });
      expect(toggleButton(wrapper).attributes('aria-label')).toBe('Show password');

      await toggleButton(wrapper).trigger('click');
      expect(wrapper.find('input').attributes('type')).toBe('text');
      expect(wrapper.find('input').attributes('autocomplete')).toBe('off');
      expect((wrapper.find('input').element as HTMLInputElement).value).toBe('secret');
      expect(toggleButton(wrapper).attributes('aria-label')).toBe('Hide password');

      await toggleButton(wrapper).trigger('click');
      expect(wrapper.find('input').attributes('type')).toBe('password');
    });
  });

  describe('input', () => {
    it('emits the input as a string in both states', async () => {
      const wrapper = mountToggle();
      await wrapper.find('input').setValue('abc');
      await toggleButton(wrapper).trigger('click');
      await wrapper.find('input').setValue('123');
      expect(wrapper.emitted('update:modelValue')).toEqual([['abc'], ['123']]);
    });

    it('relays emit:blur and emit:enter', async () => {
      const wrapper = mountToggle();
      const input = wrapper.find('input');
      await input.setValue('abc');
      await input.trigger('blur');
      await input.trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('emit:blur')).toEqual([['abc']]);
      expect(wrapper.emitted('emit:enter')).toEqual([['abc']]);
    });
  });

  describe('creating a password', () => {
    it('emits a created password of 12 characters including every kind of character by default', async () => {
      const wrapper = mountToggle();
      for (let i = 0; i < 20; i++) {
        await createButton(wrapper).trigger('click');
      }
      const passwords = wrapper.emitted('emit:passwordCreated')!.map(args => args[0] as string);
      for (const password of passwords) {
        expect(password).toHaveLength(12);
        expect(password).toMatch(/[0-9]/);
        expect(password).toMatch(/[a-z]/);
        expect(password).toMatch(/[A-Z]/);
        expect(password).toMatch(/[!@#$%^&*\-_=+?]/);
      }
      expect(new Set(passwords).size).toBe(passwords.length);
      expect(wrapper.emitted('update:modelValue')).toEqual(passwords.map(password => [password]));
    });

    it('uses createPassword when it is given', async () => {
      const wrapper = mountToggle({ createPassword: () => 'custom-password' });
      await createButton(wrapper).trigger('click');
      expect(wrapper.emitted('emit:passwordCreated')).toEqual([['custom-password']]);
    });

    it('disables the create button while readonly or disabled', () => {
      expect(createButton(mountToggle({ readonly: true })).attributes('disabled')).toBeDefined();
      expect(createButton(mountToggle({ disabled: true })).attributes('disabled')).toBeDefined();
    });
  });

  describe('error state', () => {
    it('shows the error on the input in both states, including the index', async () => {
      const errorObserver = reactive<ValidationError>({});
      const wrapper = mountToggle({
        vid: 'passwords',
        index: 1
      }, { errorObserver });
      errorObserver['passwords[1]'] = [{ code: 'code.W001' }];
      await nextTick();
      expect(wrapper.find('input').classes()).toContain('dwui-error');

      await toggleButton(wrapper).trigger('click');
      expect(wrapper.find('input').classes()).toContain('dwui-error');
    });
  });

  describe('expose', () => {
    it('getInstance and getCurrentValue follow the shown input', async () => {
      const wrapper = mountToggle({ modelValue: 'secret' });
      expect(wrapper.vm.getInstance()).toBe(wrapper.find('input').element);
      expect(wrapper.vm.getCurrentValue()).toBe('secret');

      await toggleButton(wrapper).trigger('click');
      expect(wrapper.vm.getInstance()).toBe(wrapper.find('input').element);
      expect(wrapper.vm.getCurrentValue()).toBe('secret');
    });

    it('setFocus focuses the shown input', () => {
      const wrapper = mountToggle({}, { attachTo: document.body });
      wrapper.vm.setFocus();
      expect(document.activeElement).toBe(wrapper.find('input').element);
      wrapper.unmount();
    });

    it('fireBlur emits emit:blur with the text of the input', () => {
      const wrapper = mountToggle({ modelValue: 'secret' });
      wrapper.vm.fireBlur();
      expect(wrapper.emitted('emit:blur')).toEqual([['secret']]);
    });
  });
});
