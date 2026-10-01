import { describe, it, expect } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import InputFile from '@/input-file.vue';
import { errorObserverKey } from '@/error-observer';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

type InputFileProps = InstanceType<typeof InputFile>['$props'];

const mountInputFile = (props: InputFileProps = {}, options: { attrs?: Record<string, unknown>, errorObserver?: ValidationError, attachTo?: HTMLElement } = {}) => {
  return mount(InputFile, {
    props,
    attrs: options.attrs,
    attachTo: options.attachTo,
    global: {
      plugins: [createTestI18n()],
      provide: options.errorObserver ? { [errorObserverKey as symbol]: options.errorObserver } : {}
    }
  });
};

/**
 * input要素のfilesを差し替える
 * テスト環境ではファイル選択ダイアログを操作できないため、filesプロパティを直接定義する
 */
const setFiles = (element: Element, files: File[]): FileList => {
  const fileList = Object.assign([...files], { item: (index: number) => files[index] ?? null }) as unknown as FileList;
  Object.defineProperty(element, 'files', {
    configurable: true,
    get: () => fileList
  });
  return fileList;
};

/**
 * input要素のvalueへの代入を記録する
 * ファイル入力のvalueには空文字しか代入できず、選択済みの状態をテストで作れないため、代入された値だけを確かめる
 */
const recordValueAssignments = (element: Element): string[] => {
  const assigned: string[] = [];
  Object.defineProperty(element, 'value', {
    configurable: true,
    get: () => '',
    set: (value: string) => {
      assigned.push(value);
    }
  });
  return assigned;
};

describe('InputFile', () => {
  describe('root element', () => {
    it('renders a file input as the root', () => {
      const wrapper = mountInputFile();
      expect(wrapper.element.tagName).toBe('INPUT');
      expect(wrapper.attributes('type')).toBe('file');
      expect(wrapper.classes()).toEqual(['dwui-input-file']);
    });

    it('joins an accept array with commas', () => {
      const wrapper = mountInputFile({ accept: ['.xls', '.xlsx'] });
      expect(wrapper.attributes('accept')).toBe('.xls,.xlsx');
    });

    it('sets an accept string as it is', () => {
      const wrapper = mountInputFile({ accept: 'image/*' });
      expect(wrapper.attributes('accept')).toBe('image/*');
    });

    it('passes attributes through to the input', () => {
      const wrapper = mountInputFile({}, {
        attrs: {
          class: 'wide',
          name: 'document',
          multiple: true,
          webkitdirectory: true,
          disabled: true
        }
      });
      expect(wrapper.classes()).toEqual(['dwui-input-file', 'wide']);
      expect(wrapper.attributes('name')).toBe('document');
      expect(wrapper.attributes('multiple')).toBeDefined();
      expect(wrapper.attributes('webkitdirectory')).toBeDefined();
      expect(wrapper.attributes('disabled')).toBeDefined();
    });

    it('does not render vid as a DOM attribute', () => {
      const wrapper = mountInputFile({ vid: 'document' });
      expect(wrapper.attributes('vid')).toBeUndefined();
    });
  });

  describe('change', () => {
    it('emits the selected files', async () => {
      const wrapper = mountInputFile();
      const files = setFiles(wrapper.element, [new File(['a'], 'a.csv')]);
      await wrapper.trigger('change');
      expect(wrapper.emitted('update:modelValue')).toEqual([[files]]);
      expect(wrapper.emitted('emit:change')).toEqual([[files]]);
    });

    it('emits null when no file is selected', async () => {
      const wrapper = mountInputFile();
      setFiles(wrapper.element, []);
      await wrapper.trigger('change');
      expect(wrapper.emitted('update:modelValue')).toEqual([[null]]);
      expect(wrapper.emitted('emit:change')).toEqual([[null]]);
    });
  });

  describe('clearing', () => {
    it('clears the input when modelValue changes to null, without emitting', async () => {
      const wrapper = mountInputFile();
      const files = setFiles(wrapper.element, [new File(['a'], 'a.csv')]);
      await wrapper.setProps({ modelValue: files });
      const assigned = recordValueAssignments(wrapper.element);

      await wrapper.setProps({ modelValue: null });
      expect(assigned).toEqual(['']);
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });

    it('clearInput clears the input without emitting', () => {
      const wrapper = mountInputFile();
      const assigned = recordValueAssignments(wrapper.element);
      wrapper.vm.clearInput();
      expect(assigned).toEqual(['']);
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
  });

  describe('error state', () => {
    it('adds the error class while the error observer has an error for the vid', async () => {
      const errorObserver = reactive<ValidationError>({});
      const wrapper = mountInputFile({ vid: 'document' }, { errorObserver });
      expect(wrapper.classes()).not.toContain('dwui-error');

      errorObserver.document = [{ code: 'code.W001' }];
      await nextTick();
      expect(wrapper.classes()).toContain('dwui-error');
    });
  });

  describe('expose', () => {
    it('getCurrentValue returns null when no file is selected', () => {
      const wrapper = mountInputFile();
      setFiles(wrapper.element, []);
      expect(wrapper.vm.getCurrentValue()).toBeNull();
    });

    it('getCurrentValue returns the selected files', () => {
      const wrapper = mountInputFile();
      const files = setFiles(wrapper.element, [new File(['a'], 'a.csv')]);
      expect(wrapper.vm.getCurrentValue()).toBe(files);
    });

    it('fireChange emits update:modelValue and emit:change with the selected files', () => {
      const wrapper = mountInputFile();
      const files = setFiles(wrapper.element, [new File(['a'], 'a.csv')]);
      wrapper.vm.fireChange();
      expect(wrapper.emitted('update:modelValue')).toEqual([[files]]);
      expect(wrapper.emitted('emit:change')).toEqual([[files]]);
    });

    it('setFocus focuses the input', () => {
      const wrapper = mountInputFile({}, { attachTo: document.body });
      wrapper.vm.setFocus();
      expect(document.activeElement).toBe(wrapper.element);
      wrapper.unmount();
    });
  });
});
