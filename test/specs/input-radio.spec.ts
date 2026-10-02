import { describe, it, expect } from 'vitest';
import { defineComponent, h, nextTick, reactive, ref } from 'vue';
import { mount } from '@vue/test-utils';
import InputRadio from '@/input-radio.vue';
import { errorObserverKey } from '@/error-observer';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

type InputRadioProps = InstanceType<typeof InputRadio>['$props'];

const mountInputRadio = (props: InputRadioProps, options: { attrs?: Record<string, unknown>, errorObserver?: ValidationError } = {}) => {
  return mount(InputRadio, {
    props,
    attrs: options.attrs,
    global: {
      plugins: [createTestI18n()],
      provide: options.errorObserver ? { [errorObserverKey as symbol]: options.errorObserver } : {}
    }
  });
};

const apple = {
  value: 'apple',
  label: 'Apple'
};

const radio = (wrapper: ReturnType<typeof mountInputRadio>): HTMLInputElement => wrapper.find('input').element;

describe('InputRadio', () => {
  describe('root element', () => {
    it('renders a div root with a label containing the radio and the translated label', () => {
      const wrapper = mountInputRadio({ item: apple });
      expect(wrapper.element.tagName).toBe('DIV');
      expect(wrapper.find(':scope > label').exists()).toBe(true);
      expect(wrapper.classes()).toEqual(['dwui-input-radio']);
      expect(wrapper.find('label > input').attributes('type')).toBe('radio');
      expect(wrapper.find('label > span').text()).toBe('Apple');
    });

    it('renders a label given as a function by calling it', () => {
      const wrapper = mountInputRadio({
        item: {
          value: 'apple',
          label: () => 'Fresh apple'
        }
      });
      expect(wrapper.find('label > span').text()).toBe('Fresh apple');
    });

    it('passes attributes through to the label', () => {
      const wrapper = mountInputRadio({ item: apple }, {
        attrs: {
          class: 'ml4',
          style: 'margin: 1px;'
        }
      });
      expect(wrapper.classes()).toEqual(['dwui-input-radio', 'ml4']);
      expect(wrapper.attributes('style')).toBe('margin: 1px;');
    });

    it('puts id, name and disabled on the radio', () => {
      const wrapper = mountInputRadio({
        item: apple,
        id: 'fruit-apple',
        name: 'fruit',
        disabled: true
      });
      expect(wrapper.attributes('id')).toBeUndefined();
      expect(wrapper.find('input').attributes('id')).toBe('fruit-apple');
      expect(wrapper.find('input').attributes('name')).toBe('fruit');
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('puts inputClass/inputStyle on the radio and labelClass/labelStyle on the label text', () => {
      const wrapper = mountInputRadio({
        item: apple,
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

    it('does not render vid as a DOM attribute', () => {
      const wrapper = mountInputRadio({
        item: apple,
        vid: 'fruit'
      });
      expect(wrapper.find('[vid]').exists()).toBe(false);
    });
  });

  describe('checked state', () => {
    it('is checked when modelValue matches the item value', () => {
      const wrapper = mountInputRadio({
        item: apple,
        modelValue: 'apple'
      });
      expect(radio(wrapper).checked).toBe(true);
    });

    it('follows changes of modelValue', async () => {
      const wrapper = mountInputRadio({
        item: apple,
        modelValue: 'banana'
      });
      expect(radio(wrapper).checked).toBe(false);
      await wrapper.setProps({ modelValue: 'apple' });
      expect(radio(wrapper).checked).toBe(true);
      await wrapper.setProps({ modelValue: 'banana' });
      expect(radio(wrapper).checked).toBe(false);
    });

    it('compares a number modelValue as a string', () => {
      const wrapper = mountInputRadio({
        item: {
          value: '1',
          label: 'Apple'
        },
        modelValue: 1,
        modelType: 'number'
      });
      expect(radio(wrapper).checked).toBe(true);
    });

    it('compares a boolean modelValue as a string', () => {
      const wrapper = mountInputRadio({
        item: {
          value: 'false',
          label: 'No'
        },
        modelValue: false,
        modelType: 'boolean'
      });
      expect(radio(wrapper).checked).toBe(true);
    });

    it('is not checked when modelValue is not given', () => {
      const wrapper = mountInputRadio({
        item: {
          value: 'false',
          label: 'No'
        },
        modelType: 'boolean'
      });
      expect(radio(wrapper).checked).toBe(false);
    });
  });

  describe('group', () => {
    it('keeps only the clicked radio checked in a group bound with v-model', async () => {
      const Group = defineComponent({
        setup: () => {
          const selected = ref<string | number | boolean | null>('apple');
          return () => ['apple', 'banana'].map(value => h(InputRadio, {
            'item': {
              value,
              label: value
            },
            'name': 'fruit',
            'modelValue': selected.value,
            'onUpdate:modelValue': (newValue: string | number | boolean | null) => {
              selected.value = newValue;
            }
          }));
        }
      });
      const wrapper = mount(Group, { global: { plugins: [createTestI18n()] } });
      const inputs = wrapper.findAll('input');
      expect(inputs.map(input => input.element.checked)).toEqual([true, false]);

      await inputs[1]!.setValue(true);
      expect(inputs.map(input => input.element.checked)).toEqual([false, true]);

      await inputs[0]!.setValue(true);
      expect(inputs.map(input => input.element.checked)).toEqual([true, false]);
    });
  });

  describe('change', () => {
    it('emits the item value as a string', async () => {
      const wrapper = mountInputRadio({ item: apple });
      await wrapper.find('input').setValue(true);
      expect(wrapper.emitted('update:modelValue')).toEqual([['apple']]);
      expect(wrapper.emitted('emit:change')).toEqual([['apple']]);
    });

    it('emits a number with modelType number', async () => {
      const wrapper = mountInputRadio({
        item: {
          value: '2',
          label: 'Apple'
        },
        modelType: 'number'
      });
      await wrapper.find('input').setValue(true);
      expect(wrapper.emitted('update:modelValue')).toEqual([[2]]);
    });

    it('emits a boolean with modelType boolean', async () => {
      const wrapper = mountInputRadio({
        item: {
          value: 'false',
          label: 'No'
        },
        modelType: 'boolean'
      });
      await wrapper.find('input').setValue(true);
      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });
  });

  describe('error state', () => {
    it('adds the error class to the root while the error observer has an error for the vid', async () => {
      const errorObserver = reactive<ValidationError>({});
      const wrapper = mountInputRadio({
        item: apple,
        vid: 'fruit'
      }, { errorObserver });
      expect(wrapper.classes()).not.toContain('dwui-error');

      errorObserver.fruit = [{ code: 'code.W001' }];
      await nextTick();
      expect(wrapper.classes()).toContain('dwui-error');
    });
  });

  describe('expose', () => {
    it('getCurrentValue returns the item value converted by modelType', () => {
      const wrapper = mountInputRadio({
        item: {
          value: '3',
          label: 'Apple'
        },
        modelType: 'number'
      });
      expect(wrapper.vm.getCurrentValue()).toBe(3);
    });

    it('getCurrentValue returns a boolean with modelType boolean', () => {
      const wrapper = mountInputRadio({
        item: {
          value: 'true',
          label: 'Yes'
        },
        modelType: 'boolean'
      });
      expect(wrapper.vm.getCurrentValue()).toBe(true);
    });

    it('fireChange emits the item value', () => {
      const wrapper = mountInputRadio({ item: apple });
      wrapper.vm.fireChange();
      expect(wrapper.emitted('update:modelValue')).toEqual([['apple']]);
      expect(wrapper.emitted('emit:change')).toEqual([['apple']]);
    });

    it('getInstance returns the radio', () => {
      const wrapper = mountInputRadio({ item: apple });
      expect(wrapper.vm.getInstance()).toBe(radio(wrapper));
    });
  });
});
