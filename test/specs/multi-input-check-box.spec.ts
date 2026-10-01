import { describe, it, expect } from 'vitest';
import { defineComponent, h, nextTick, reactive, ref } from 'vue';
import { mount } from '@vue/test-utils';
import MultiInputCheckBox from '@/multi-input-check-box.vue';
import { errorObserverKey } from '@/error-observer';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

type MultiInputCheckBoxProps = InstanceType<typeof MultiInputCheckBox>['$props'];

const mountMultiInputCheckBox = (props: MultiInputCheckBoxProps, options: { attrs?: Record<string, unknown>, errorObserver?: ValidationError, slot?: string } = {}) => {
  return mount(MultiInputCheckBox, {
    props,
    attrs: options.attrs,
    slots: options.slot ? { default: options.slot } : undefined,
    global: {
      plugins: [createTestI18n()],
      provide: options.errorObserver ? { [errorObserverKey as symbol]: options.errorObserver } : {}
    }
  });
};

const checkBox = (wrapper: ReturnType<typeof mountMultiInputCheckBox>): HTMLInputElement => wrapper.find('input').element;

describe('MultiInputCheckBox', () => {
  describe('root element', () => {
    it('renders a div root with a label containing the checkbox and the slot wrapped in a span', () => {
      const wrapper = mountMultiInputCheckBox({
        modelValue: [],
        value: 'open'
      }, { slot: 'Open <b>now</b>' });
      expect(wrapper.element.tagName).toBe('DIV');
      expect(wrapper.find(':scope > label').exists()).toBe(true);
      expect(wrapper.classes()).toEqual(['dwui-multi-input-check-box']);
      expect(wrapper.find('label > input').attributes('type')).toBe('checkbox');
      expect(wrapper.find('label > input + span').element.innerHTML).toBe('Open <b>now</b>');
    });

    it('passes attributes through to the label', () => {
      const wrapper = mountMultiInputCheckBox({ modelValue: [] }, {
        attrs: {
          class: 'ml4',
          style: 'margin: 1px;'
        }
      });
      expect(wrapper.classes()).toEqual(['dwui-multi-input-check-box', 'ml4']);
      expect(wrapper.attributes('style')).toBe('margin: 1px;');
    });

    it('puts id, name and disabled on the checkbox', () => {
      const wrapper = mountMultiInputCheckBox({
        modelValue: [],
        id: 'status-open',
        name: 'status',
        disabled: true
      });
      expect(wrapper.attributes('id')).toBeUndefined();
      expect(wrapper.find('input').attributes('id')).toBe('status-open');
      expect(wrapper.find('input').attributes('name')).toBe('status');
      expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('puts inputClass/inputStyle on the checkbox and labelClass/labelStyle on the label text', () => {
      const wrapper = mountMultiInputCheckBox({
        modelValue: [],
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
      const wrapper = mountMultiInputCheckBox({
        modelValue: [],
        vid: 'status'
      });
      expect(wrapper.find('[vid]').exists()).toBe(false);
    });
  });

  describe('checked state', () => {
    it('is checked when modelValue contains the value', () => {
      const wrapper = mountMultiInputCheckBox({
        modelValue: ['open', 'closed'],
        value: 'open'
      });
      expect(checkBox(wrapper).checked).toBe(true);
    });

    it('follows changes of modelValue', async () => {
      const wrapper = mountMultiInputCheckBox({
        modelValue: [],
        value: 'open'
      });
      expect(checkBox(wrapper).checked).toBe(false);
      await wrapper.setProps({ modelValue: ['open'] });
      expect(checkBox(wrapper).checked).toBe(true);
    });
  });

  describe('change', () => {
    it('adds and removes the value in the array', async () => {
      const wrapper = mountMultiInputCheckBox({
        modelValue: ['closed'],
        value: 'open'
      });
      await wrapper.find('input').setValue(true);
      expect(wrapper.emitted('update:modelValue')).toEqual([[['closed', 'open']]]);
      expect(wrapper.emitted('emit:change')).toEqual([[['closed', 'open']]]);
    });

    it('converts the values to numbers with modelType number', async () => {
      const wrapper = mountMultiInputCheckBox({
        modelValue: ['1'],
        value: '2',
        modelType: 'number'
      });
      await wrapper.find('input').setValue(true);
      expect(wrapper.emitted('update:modelValue')).toEqual([[[1, 2]]]);
    });

    it('binds a group of checkboxes to one array with v-model', async () => {
      const Group = defineComponent({
        setup: () => {
          const selected = ref<(string | number | null)[]>([]);
          return () => ['open', 'closed'].map(value => h(MultiInputCheckBox, {
            'value': value,
            'modelValue': selected.value,
            'onUpdate:modelValue': (newValue: (string | number | null)[]) => {
              selected.value = newValue;
            }
          }));
        }
      });
      const wrapper = mount(Group, { global: { plugins: [createTestI18n()] } });
      const inputs = wrapper.findAll('input');
      await inputs[1]!.setValue(true);
      await inputs[0]!.setValue(true);
      expect(inputs.map(input => input.element.checked)).toEqual([true, true]);
      await inputs[1]!.setValue(false);
      expect(inputs.map(input => input.element.checked)).toEqual([true, false]);
    });
  });

  describe('error state', () => {
    it('adds the error class to the root while the error observer has an error for the vid', async () => {
      const errorObserver = reactive<ValidationError>({});
      const wrapper = mountMultiInputCheckBox({
        modelValue: [],
        vid: 'status'
      }, { errorObserver });
      expect(wrapper.classes()).not.toContain('dwui-error');

      errorObserver.status = [{ code: 'code.W001' }];
      await nextTick();
      expect(wrapper.classes()).toContain('dwui-error');
    });
  });

  describe('expose', () => {
    it('fireChange emits update:modelValue and emit:change with the current modelValue', () => {
      const wrapper = mountMultiInputCheckBox({
        modelValue: ['open'],
        value: 'open'
      });
      wrapper.vm.fireChange();
      expect(wrapper.emitted('update:modelValue')).toEqual([[['open']]]);
      expect(wrapper.emitted('emit:change')).toEqual([[['open']]]);
    });

    it('getInstance returns the checkbox', () => {
      const wrapper = mountMultiInputCheckBox({ modelValue: [] });
      expect(wrapper.vm.getInstance()).toBe(checkBox(wrapper));
    });
  });
});
