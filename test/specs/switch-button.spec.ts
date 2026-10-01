import { describe, it, expect } from 'vitest';
import { defineComponent, h, nextTick, reactive, ref } from 'vue';
import { mount } from '@vue/test-utils';
import SwitchButton from '@/switch-button.vue';
import { errorObserverKey } from '@/error-observer';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

type SwitchButtonProps = InstanceType<typeof SwitchButton>['$props'];

const mountSwitchButton = (props: SwitchButtonProps = {}, options: { attrs?: Record<string, unknown>, errorObserver?: ValidationError, slots?: Record<string, string> } = {}) => {
  return mount(SwitchButton, {
    props,
    attrs: options.attrs,
    slots: options.slots,
    global: {
      plugins: [createTestI18n()],
      provide: options.errorObserver ? { [errorObserverKey as symbol]: options.errorObserver } : {}
    }
  });
};

const checkBox = (wrapper: ReturnType<typeof mountSwitchButton>): HTMLInputElement => wrapper.find('input').element;

describe('SwitchButton', () => {
  describe('root element', () => {
    it('renders a div root with a label containing the checkbox, the track with the labels and the handle', () => {
      const wrapper = mountSwitchButton({
        labelOn: 'ON',
        labelOff: 'OFF'
      });
      expect(wrapper.element.tagName).toBe('DIV');
      expect(wrapper.find(':scope > label').exists()).toBe(true);
      expect(wrapper.classes()).toEqual(['dwui-switch-button']);
      expect(wrapper.find('label > input').attributes('type')).toBe('checkbox');
      expect(wrapper.find('.dwui-switch-button-label-on').text()).toBe('ON');
      expect(wrapper.find('.dwui-switch-button-label-off').text()).toBe('OFF');
      expect(wrapper.find('label > .dwui-switch-button-handle').exists()).toBe(true);
    });

    it('replaces the labels with the slots', () => {
      const wrapper = mountSwitchButton({ labelOn: 'ON' }, {
        slots: {
          'label-on': '<svg class="moon" />',
          'label-off': '<svg class="sun" />'
        }
      });
      expect(wrapper.find('.dwui-switch-button-label-on .moon').exists()).toBe(true);
      expect(wrapper.find('.dwui-switch-button-label-on').text()).toBe('');
      expect(wrapper.find('.dwui-switch-button-label-off .sun').exists()).toBe(true);
    });

    it('passes attributes through to the label', () => {
      const wrapper = mountSwitchButton({}, {
        attrs: {
          class: 'ml4',
          style: 'margin: 1px;'
        }
      });
      expect(wrapper.classes()).toEqual(['dwui-switch-button', 'ml4']);
      expect(wrapper.attributes('style')).toBe('margin: 1px;');
    });

    it('puts id, name and disabled on the checkbox', () => {
      const wrapper = mountSwitchButton({
        id: 'dark-mode',
        name: 'dark-mode',
        disabled: true
      });
      expect(wrapper.attributes('id')).toBeUndefined();
      expect(wrapper.find('input').attributes('id')).toBe('dark-mode');
      expect(wrapper.find('input').attributes('name')).toBe('dark-mode');
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('does not render vid or v-model helper attributes on the DOM', () => {
      const wrapper = mountSwitchButton({
        vid: 'darkMode',
        modelValue: true
      });
      expect(wrapper.find('[vid]').exists()).toBe(false);
      expect(wrapper.find('input').attributes('model-value')).toBeUndefined();
    });
  });

  describe('background', () => {
    it('does not set the background variables when bgOn and bgOff are not given', () => {
      const wrapper = mountSwitchButton();
      expect(wrapper.attributes('style')).toBeUndefined();
    });

    it('sets bgOn and bgOff to the background variables', () => {
      const wrapper = mountSwitchButton({
        bgOn: 'darkslategray',
        bgOff: 'azure'
      });
      const style = (wrapper.element as HTMLElement).style;
      expect(style.getPropertyValue('--dwui-background-switch-button')).toBe('azure');
      expect(style.getPropertyValue('--dwui-background-switch-button-checked')).toBe('darkslategray');
    });

    it('keeps the style given by the caller together with the background variables', () => {
      const wrapper = mountSwitchButton({ bgOn: 'darkslategray' }, { attrs: { style: 'margin: 1px;' } });
      const style = (wrapper.element as HTMLElement).style;
      expect(style.getPropertyValue('--dwui-background-switch-button-checked')).toBe('darkslategray');
      expect(style.margin).toBe('1px');
    });
  });

  describe('checked state', () => {
    it('is checked on the first render when modelValue is true', () => {
      const wrapper = mountSwitchButton({ modelValue: true });
      expect(checkBox(wrapper).checked).toBe(true);
    });

    it('follows changes of modelValue', async () => {
      const wrapper = mountSwitchButton({ modelValue: false });
      await wrapper.setProps({ modelValue: true });
      expect(checkBox(wrapper).checked).toBe(true);
      await wrapper.setProps({ modelValue: false });
      expect(checkBox(wrapper).checked).toBe(false);
    });

    it('keeps the checked state in sync when toggled with v-model', async () => {
      const Parent = defineComponent({
        setup: () => {
          const isDark = ref(false);
          return () => h(SwitchButton, {
            'modelValue': isDark.value,
            'onUpdate:modelValue': (newValue: boolean) => {
              isDark.value = newValue;
            }
          });
        }
      });
      const wrapper = mount(Parent, { global: { plugins: [createTestI18n()] } });
      const input = wrapper.find('input');
      await input.setValue(true);
      expect(input.element.checked).toBe(true);
      await input.setValue(false);
      expect(input.element.checked).toBe(false);
    });
  });

  describe('change', () => {
    it('emits update:modelValue and emit:change with the checked state', async () => {
      const wrapper = mountSwitchButton();
      await wrapper.find('input').setValue(true);
      await wrapper.find('input').setValue(false);
      expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]]);
      expect(wrapper.emitted('emit:change')).toEqual([[true], [false]]);
    });
  });

  describe('error state', () => {
    it('adds the error class to the root while the error observer has an error for the vid', async () => {
      const errorObserver = reactive<ValidationError>({});
      const wrapper = mountSwitchButton({ vid: 'darkMode' }, { errorObserver });
      expect(wrapper.classes()).not.toContain('dwui-error');

      errorObserver.darkMode = [{ code: 'code.W001' }];
      await nextTick();
      expect(wrapper.classes()).toContain('dwui-error');
    });
  });

  describe('expose', () => {
    it('setChecked changes only the checked state, without emitting', () => {
      const wrapper = mountSwitchButton({ modelValue: false });
      wrapper.vm.setChecked(true);
      expect(checkBox(wrapper).checked).toBe(true);
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('fireChange emits update:modelValue and emit:change with the checked state', () => {
      const wrapper = mountSwitchButton({ modelValue: true });
      wrapper.vm.fireChange();
      expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
      expect(wrapper.emitted('emit:change')).toEqual([[true]]);
    });

    it('getCurrentValue returns the checked state', () => {
      const wrapper = mountSwitchButton({ modelValue: true });
      expect(wrapper.vm.getCurrentValue()).toBe(true);
    });

    it('getInstance returns the checkbox', () => {
      const wrapper = mountSwitchButton();
      expect(wrapper.vm.getInstance()).toBe(checkBox(wrapper));
    });
  });
});
