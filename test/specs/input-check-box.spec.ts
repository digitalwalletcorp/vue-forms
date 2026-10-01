import { describe, it, expect } from 'vitest';
import { defineComponent, h, nextTick, reactive, ref } from 'vue';
import { mount } from '@vue/test-utils';
import InputCheckBox from '@/input-check-box.vue';
import { errorObserverKey } from '@/error-observer';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

type InputCheckBoxProps = InstanceType<typeof InputCheckBox>['$props'];

const mountInputCheckBox = (props: InputCheckBoxProps = {}, options: { attrs?: Record<string, unknown>, errorObserver?: ValidationError, slot?: string } = {}) => {
  return mount(InputCheckBox, {
    props,
    attrs: options.attrs,
    slots: options.slot ? { default: options.slot } : undefined,
    global: {
      plugins: [createTestI18n()],
      provide: options.errorObserver ? { [errorObserverKey as symbol]: options.errorObserver } : {}
    }
  });
};

const checkBox = (wrapper: ReturnType<typeof mountInputCheckBox>): HTMLInputElement => wrapper.find('input').element;

describe('InputCheckBox', () => {
  describe('root element', () => {
    it('renders a div root with a label containing the checkbox and the slot wrapped in a span', () => {
      const wrapper = mountInputCheckBox({}, { slot: 'Agree <b>now</b>' });
      expect(wrapper.element.tagName).toBe('DIV');
      expect(wrapper.find(':scope > label').exists()).toBe(true);
      expect(wrapper.classes()).toEqual(['dwui-input-check-box']);
      expect(wrapper.find('label > input').attributes('type')).toBe('checkbox');
      expect(wrapper.find('label > input + span').element.innerHTML).toBe('Agree <b>now</b>');
    });

    it('passes attributes through to the label', () => {
      const wrapper = mountInputCheckBox({}, {
        attrs: {
          class: 'ml4',
          style: 'margin: 1px;'
        }
      });
      expect(wrapper.classes()).toEqual(['dwui-input-check-box', 'ml4']);
      expect(wrapper.attributes('style')).toBe('margin: 1px;');
    });

    it('puts id, name and disabled on the checkbox', () => {
      const wrapper = mountInputCheckBox({
        id: 'agree',
        name: 'agree',
        disabled: true
      });
      expect(wrapper.attributes('id')).toBeUndefined();
      expect(wrapper.find('input').attributes('id')).toBe('agree');
      expect(wrapper.find('input').attributes('name')).toBe('agree');
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('puts inputClass/inputStyle on the checkbox and labelClass/labelStyle on the label text', () => {
      const wrapper = mountInputCheckBox({
        inputClass: 'large',
        inputStyle: { margin: '2px' },
        labelClass: 'bold',
        labelStyle: { color: 'red' }
      });
      expect(wrapper.find('input').classes()).toEqual(['large']);
      expect(wrapper.find('input').attributes('style')).toBe('margin: 2px;');
      expect(wrapper.find('label > span').classes()).toEqual(['bold']);
      expect(wrapper.find('label > span').attributes('style')).toBe('color: red;');
    });

    it('does not render vid or v-model helper attributes on the DOM', () => {
      const wrapper = mountInputCheckBox({
        vid: 'agree',
        trueValue: 'Y',
        falseValue: 'N'
      });
      const input = wrapper.find('input');
      expect(wrapper.find('[vid]').exists()).toBe(false);
      expect(input.attributes('model-value')).toBeUndefined();
      expect(input.attributes('true-value')).toBeUndefined();
      expect(input.attributes('false-value')).toBeUndefined();
    });
  });

  describe('checked state', () => {
    it('is checked on the first render when modelValue equals trueValue', () => {
      const wrapper = mountInputCheckBox({ modelValue: true });
      expect(checkBox(wrapper).checked).toBe(true);
    });

    it('follows changes of modelValue', async () => {
      const wrapper = mountInputCheckBox({
        modelValue: 'N',
        trueValue: 'Y',
        falseValue: 'N'
      });
      expect(checkBox(wrapper).checked).toBe(false);
      await wrapper.setProps({ modelValue: 'Y' });
      expect(checkBox(wrapper).checked).toBe(true);
      await wrapper.setProps({ modelValue: 'N' });
      expect(checkBox(wrapper).checked).toBe(false);
    });

    it('keeps the checked state in sync when toggled with v-model', async () => {
      const Parent = defineComponent({
        setup: () => {
          const agreed = ref<string | number | boolean>(false);
          return () => h(InputCheckBox, {
            'modelValue': agreed.value,
            'onUpdate:modelValue': (newValue: string | number | boolean) => {
              agreed.value = newValue;
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
    it('emits trueValue when checked and falseValue when unchecked', async () => {
      const wrapper = mountInputCheckBox({
        trueValue: 1,
        falseValue: 0
      });
      await wrapper.find('input').setValue(true);
      await wrapper.find('input').setValue(false);
      expect(wrapper.emitted('update:modelValue')).toEqual([[1], [0]]);
      expect(wrapper.emitted('emit:change')).toEqual([[1], [0]]);
    });
  });

  describe('error state', () => {
    it('adds the error class to the root while the error observer has an error for the vid', async () => {
      const errorObserver = reactive<ValidationError>({});
      const wrapper = mountInputCheckBox({ vid: 'agree' }, { errorObserver });
      expect(wrapper.classes()).not.toContain('dwui-error');

      errorObserver.agree = [{ code: 'code.W001' }];
      await nextTick();
      expect(wrapper.classes()).toContain('dwui-error');
    });
  });

  describe('expose', () => {
    it('setChecked changes only the checked state, without emitting', () => {
      const wrapper = mountInputCheckBox({ modelValue: false });
      wrapper.vm.setChecked(true);
      expect(checkBox(wrapper).checked).toBe(true);
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('getCurrentValue returns trueValue or falseValue by the checked state', () => {
      const wrapper = mountInputCheckBox({
        modelValue: 'Y',
        trueValue: 'Y',
        falseValue: 'N'
      });
      expect(wrapper.vm.getCurrentValue()).toBe('Y');
      wrapper.vm.setChecked(false);
      expect(wrapper.vm.getCurrentValue()).toBe('N');
    });

    it('fireChange emits the value of the checked state', () => {
      const wrapper = mountInputCheckBox({ modelValue: true });
      wrapper.vm.fireChange();
      expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
      expect(wrapper.emitted('emit:change')).toEqual([[true]]);
    });

    it('getInstance returns the checkbox', () => {
      const wrapper = mountInputCheckBox();
      expect(wrapper.vm.getInstance()).toBe(checkBox(wrapper));
    });
  });
});
