import { describe, it, expect } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import SelectBox from '@/select-box.vue';
import { errorObserverKey } from '@/error-observer';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

type SelectBoxProps = InstanceType<typeof SelectBox>['$props'];

const mountSelectBox = (props: SelectBoxProps = {}, options: { attrs?: Record<string, unknown>, errorObserver?: ValidationError } = {}) => {
  return mount(SelectBox, {
    props,
    attrs: options.attrs,
    global: {
      plugins: [createTestI18n()],
      provide: options.errorObserver ? { [errorObserverKey as symbol]: options.errorObserver } : {}
    }
  });
};

const fruits = [
  {
    value: 'apple',
    label: 'Apple'
  },
  {
    value: 'banana',
    label: 'Banana'
  }
];

const optionTexts = (wrapper: ReturnType<typeof mountSelectBox>): string[] => wrapper.findAll('option').map(option => option.text());

describe('SelectBox', () => {
  describe('root element', () => {
    it('renders a select as the root', () => {
      const wrapper = mountSelectBox({ items: fruits });
      expect(wrapper.element.tagName).toBe('SELECT');
      expect(wrapper.classes()).toEqual(['dwui-select-box']);
    });

    it('passes attributes through to the select', () => {
      const wrapper = mountSelectBox({ items: fruits }, {
        attrs: {
          class: 'wide',
          name: 'fruit',
          disabled: true
        }
      });
      expect(wrapper.classes()).toEqual(['dwui-select-box', 'wide']);
      expect(wrapper.attributes('name')).toBe('fruit');
      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('does not render vid as a DOM attribute', () => {
      const wrapper = mountSelectBox({ vid: 'fruit' });
      expect(wrapper.attributes('vid')).toBeUndefined();
    });

    it('renders a label given as a function by calling it', () => {
      const wrapper = mountSelectBox({
        items: [{
          value: 'apple',
          label: () => 'Fresh apple'
        }],
        noBlank: true
      });
      expect(optionTexts(wrapper)).toEqual(['Fresh apple']);
    });
  });

  describe('options', () => {
    it('puts a blank option first and translates the labels', () => {
      const wrapper = mountSelectBox({ items: fruits });
      expect(optionTexts(wrapper)).toEqual(['', 'Apple', 'Banana']);
    });

    it('omits the blank option with noBlank', () => {
      const wrapper = mountSelectBox({ items: fruits, noBlank: true });
      expect(optionTexts(wrapper)).toEqual(['Apple', 'Banana']);
    });

    it('hides items whose visible is false', () => {
      const wrapper = mountSelectBox({
        items: [
          fruits[0]!,
          {
            ...fruits[1]!,
            visible: false
          }
        ],
        noBlank: true
      });
      expect(optionTexts(wrapper)).toEqual(['Apple']);
    });

    it('renders groups as optgroup, hiding invisible children', () => {
      const wrapper = mountSelectBox({
        items: [{
          optGroup: 'Fruits',
          children: [
            fruits[0]!,
            {
              ...fruits[1]!,
              visible: false
            }
          ]
        }],
        noBlank: true
      });
      expect(wrapper.find('optgroup').attributes('label')).toBe('Fruits');
      expect(wrapper.findAll('optgroup > option').map(option => option.text())).toEqual(['Apple']);
    });

    it('selects the blank option when modelValue is not given', () => {
      const wrapper = mountSelectBox({
        items: [
          {
            value: true,
            label: 'Yes'
          },
          {
            value: false,
            label: 'No'
          }
        ],
        modelType: 'boolean'
      });
      expect((wrapper.element as HTMLSelectElement).selectedIndex).toBe(0);
    });
  });

  describe('change', () => {
    it('emits the selected value as a string', async () => {
      const wrapper = mountSelectBox({ items: fruits });
      await wrapper.find('select').setValue('banana');
      expect(wrapper.emitted('update:modelValue')).toEqual([['banana']]);
      expect(wrapper.emitted('emit:change')).toEqual([['banana']]);
    });

    it('emits a number, and null for the blank option, with modelType number', async () => {
      const wrapper = mountSelectBox({
        items: [{
          value: 1,
          label: 'Apple'
        }],
        modelType: 'number'
      });
      await wrapper.find('select').setValue('1');
      await wrapper.find('select').setValue('');
      expect(wrapper.emitted('update:modelValue')).toEqual([[1], [null]]);
      expect(wrapper.emitted('emit:change')).toEqual([[1], [null]]);
    });

    it('emits a boolean, and null for the blank option, with modelType boolean', async () => {
      const wrapper = mountSelectBox({
        items: [
          {
            value: true,
            label: 'Yes'
          },
          {
            value: false,
            label: 'No'
          }
        ],
        modelType: 'boolean'
      });
      await wrapper.find('select').setValue('true');
      await wrapper.find('select').setValue('false');
      await wrapper.find('select').setValue('');
      expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false], [null]]);
      expect(wrapper.emitted('emit:change')).toEqual([[true], [false], [null]]);
    });
  });

  describe('null selection', () => {
    const itemsWithNull = [
      {
        value: 'apple',
        label: 'Apple'
      },
      {
        value: null,
        label: 'None'
      }
    ];

    it('selects the option whose value is null when modelValue is null', () => {
      const wrapper = mountSelectBox({
        items: itemsWithNull,
        modelValue: null,
        noBlank: true
      });
      expect((wrapper.element as HTMLSelectElement).selectedIndex).toBe(1);
    });

    it('keeps the null selection when modelValue changes to null', async () => {
      const wrapper = mountSelectBox({
        items: itemsWithNull,
        modelValue: 'apple',
        noBlank: true
      });
      expect((wrapper.element as HTMLSelectElement).selectedIndex).toBe(0);
      await wrapper.setProps({ modelValue: null });
      await nextTick();
      expect((wrapper.element as HTMLSelectElement).selectedIndex).toBe(1);
    });

    it('selects the option for a boolean modelValue, and the option whose value is null for null', async () => {
      const wrapper = mountSelectBox({
        items: [
          {
            value: null,
            label: 'Both'
          },
          {
            value: true,
            label: 'Yes'
          },
          {
            value: false,
            label: 'No'
          }
        ],
        modelType: 'boolean',
        modelValue: false,
        noBlank: true
      });
      expect((wrapper.element as HTMLSelectElement).selectedIndex).toBe(2);
      await wrapper.setProps({ modelValue: true });
      expect((wrapper.element as HTMLSelectElement).selectedIndex).toBe(1);
      await wrapper.setProps({ modelValue: null });
      await nextTick();
      expect((wrapper.element as HTMLSelectElement).selectedIndex).toBe(0);
    });
  });

  describe('error state', () => {
    it('adds the error class while the error observer has an error for the vid', async () => {
      const errorObserver = reactive<ValidationError>({});
      const wrapper = mountSelectBox({ vid: 'fruit' }, { errorObserver });
      expect(wrapper.classes()).not.toContain('dwui-error');

      errorObserver.fruit = [{ code: 'code.W001' }];
      await nextTick();
      expect(wrapper.classes()).toContain('dwui-error');
    });
  });

  describe('expose', () => {
    it('getCurrentValue converts the selected value by modelType', () => {
      const wrapper = mountSelectBox({
        items: [{
          value: 2,
          label: 'Apple'
        }],
        modelType: 'number',
        modelValue: 2
      });
      expect(wrapper.vm.getCurrentValue()).toBe(2);
    });

    it('getCurrentValue returns a boolean with modelType boolean', () => {
      const wrapper = mountSelectBox({
        items: [
          {
            value: true,
            label: 'Yes'
          },
          {
            value: false,
            label: 'No'
          }
        ],
        modelType: 'boolean',
        modelValue: false
      });
      expect(wrapper.vm.getCurrentValue()).toBe(false);
    });

    it('fireChange emits the selected value', () => {
      const wrapper = mountSelectBox({
        items: fruits,
        modelValue: 'apple'
      });
      wrapper.vm.fireChange();
      expect(wrapper.emitted('update:modelValue')).toEqual([['apple']]);
      expect(wrapper.emitted('emit:change')).toEqual([['apple']]);
    });
  });
});
