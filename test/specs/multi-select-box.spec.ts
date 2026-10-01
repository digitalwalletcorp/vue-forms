import { describe, it, expect, afterEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import MultiSelectBox from '@/multi-select-box.vue';
import { errorObserverKey } from '@/error-observer';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

type MultiSelectBoxProps = InstanceType<typeof MultiSelectBox>['$props'];

const mounted: ReturnType<typeof mount>[] = [];

const mountMultiSelectBox = (props: MultiSelectBoxProps, options: { attrs?: Record<string, unknown>, errorObserver?: ValidationError } = {}) => {
  const wrapper = mount(MultiSelectBox, {
    props,
    attrs: options.attrs,
    attachTo: document.body,
    global: {
      plugins: [createTestI18n()],
      provide: options.errorObserver ? { [errorObserverKey as symbol]: options.errorObserver } : {}
    }
  });
  mounted.push(wrapper);
  return wrapper;
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

/**
 * ドロップダウンの表示・非表示が描画に反映されるまで待つ
 * floating-vueはタイマーで表示を切り替えるため、Promiseの解決だけでは反映されない
 */
const settle = async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
  await flushPromises();
};

const textArea = (wrapper: ReturnType<typeof mountMultiSelectBox>): HTMLTextAreaElement => wrapper.find('textarea').element;

/**
 * テキストエリアの位置を与える
 * テスト環境は要素の位置を計算しないため、右下のリサイズ用の角の判定に使う位置を固定する
 */
const placeTextArea = (wrapper: ReturnType<typeof mountMultiSelectBox>) => {
  textArea(wrapper).getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    right: 200,
    bottom: 40,
    width: 200,
    height: 40,
    x: 0,
    y: 0,
    toJSON: () => ({})
  });
};

/**
 * テキストエリアの中央をクリックして選択リストを開き、リストの要素を返す
 * floating-vueがドロップダウンを描画するタイミングは一定でないため、要素が現れるまで待つ
 */
const openList = async (wrapper: ReturnType<typeof mountMultiSelectBox>): Promise<HTMLElement> => {
  placeTextArea(wrapper);
  await wrapper.find('textarea').trigger('click', {
    clientX: 100,
    clientY: 20
  });
  let list: HTMLElement | null = null;
  for (let i = 0; i < 20 && !list; i++) {
    await settle();
    list = document.body.querySelector<HTMLElement>('.dwui-multi-select-box-list');
  }
  return list!;
};

const clickButton = async (list: HTMLElement, label: string) => {
  const button = Array.from(list.querySelectorAll('button')).find(b => b.textContent?.trim() === label)!;
  button.click();
  await settle();
};

const checkItem = async (list: HTMLElement, label: string) => {
  const target = Array.from(list.querySelectorAll('label')).find(l => l.textContent?.trim() === label)!;
  target.querySelector('input')!.click();
  await settle();
};

describe('MultiSelectBox', () => {
  afterEach(() => {
    mounted.splice(0).forEach(wrapper => wrapper.unmount());
  });

  describe('root element', () => {
    it('renders a div container with a read-only textarea', () => {
      const wrapper = mountMultiSelectBox({ modelValue: [], items: fruits });
      expect(wrapper.element.tagName).toBe('DIV');
      expect(wrapper.classes()).toEqual(['dwui-multi-select-box']);
      expect(textArea(wrapper).readOnly).toBe(true);
      expect(wrapper.find('textarea').attributes('cols')).toBe('20');
      expect(wrapper.find('textarea').attributes('rows')).toBe('1');
    });

    it('passes attributes through to the container, and textarea props to the textarea', () => {
      const wrapper = mountMultiSelectBox({
        modelValue: [],
        items: fruits,
        id: 'fruits',
        name: 'fruits',
        cols: 40,
        rows: 3,
        inputClass: 'wide'
      }, { attrs: { class: 'ml4' } });
      expect(wrapper.classes()).toEqual(['dwui-multi-select-box', 'ml4']);
      expect(textArea(wrapper).id).toBe('fruits');
      expect(textArea(wrapper).name).toBe('fruits');
      expect(wrapper.find('textarea').attributes('cols')).toBe('40');
      expect(wrapper.find('textarea').attributes('rows')).toBe('3');
      expect(textArea(wrapper).classList).toContain('wide');
    });
  });

  describe('display', () => {
    it('shows the translated labels of the selected items in the order of the items', () => {
      const wrapper = mountMultiSelectBox({ modelValue: ['banana', 'apple'], items: fruits });
      expect(textArea(wrapper).value).toBe('Apple, Banana');
    });

    it('shows one label per line with lineFeed', () => {
      const wrapper = mountMultiSelectBox({ modelValue: ['apple', 'banana'], items: fruits, lineFeed: true });
      expect(textArea(wrapper).value).toBe('Apple\nBanana');
    });

    it('shows a label given as a function by calling it, in the textarea and in the list', async () => {
      const wrapper = mountMultiSelectBox({
        modelValue: ['apple'],
        items: [{
          value: 'apple',
          label: () => 'Fresh apple'
        }]
      });
      expect(textArea(wrapper).value).toBe('Fresh apple');
      const list = await openList(wrapper);
      expect(Array.from(list.querySelectorAll('label')).map(l => l.textContent?.trim())).toEqual(['Fresh apple']);
    });

    it('shows the labels of items in groups', () => {
      const wrapper = mountMultiSelectBox({
        modelValue: ['banana'],
        items: [{
          optGroup: 'Fruits',
          children: fruits
        }]
      });
      expect(textArea(wrapper).value).toBe('Banana');
    });
  });

  describe('selection list', () => {
    it('opens the list on click, and applies the selection with OK', async () => {
      const wrapper = mountMultiSelectBox({ modelValue: [], items: fruits });
      const list = await openList(wrapper);
      expect(list).not.toBeNull();

      await checkItem(list, 'Banana');
      await checkItem(list, 'Apple');
      await clickButton(list, 'OK');
      // チェックした順ではなく、選択肢の並び順になる
      expect(wrapper.emitted('update:modelValue')).toEqual([[['apple', 'banana']]]);
      expect(wrapper.emitted('emit:change')).toEqual([[['apple', 'banana']]]);
    });

    it('does not open the list when the resize corner at the bottom right is clicked', async () => {
      const wrapper = mountMultiSelectBox({ modelValue: [], items: fruits });
      placeTextArea(wrapper);
      await wrapper.find('textarea').trigger('click', {
        clientX: 195,
        clientY: 35
      });
      await settle();
      expect(document.body.querySelector('.dwui-multi-select-box-list')).toBeNull();
    });

    it('opens the list with the Enter key', async () => {
      const wrapper = mountMultiSelectBox({ modelValue: [], items: fruits });
      await wrapper.find('textarea').trigger('keydown', { key: 'Enter' });
      await settle();
      expect(document.body.querySelector('.dwui-multi-select-box-list')).not.toBeNull();
    });

    it('does not open the list while disabled', async () => {
      const wrapper = mountMultiSelectBox({ modelValue: [], items: fruits, disabled: true });
      expect(await openList(wrapper)).toBeNull();
    });

    it('discards the selection with Close and emits emit:listClosed', async () => {
      const wrapper = mountMultiSelectBox({ modelValue: ['apple'], items: fruits });
      const list = await openList(wrapper);
      await checkItem(list, 'Banana');
      await clickButton(list, 'Close');
      // floating-vueがapply-hideを出すタイミングは一定でないため、出るまで待つ
      for (let i = 0; i < 20 && !wrapper.emitted('emit:listClosed'); i++) {
        await settle();
      }
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
      expect(wrapper.emitted('emit:listClosed')).toHaveLength(1);
    });

    it('converts the values with modelType number', async () => {
      const wrapper = mountMultiSelectBox({
        modelValue: [],
        modelType: 'number',
        items: [
          {
            value: 1,
            label: 'Apple'
          },
          {
            value: 2,
            label: 'Banana'
          }
        ]
      });
      const list = await openList(wrapper);
      await checkItem(list, 'Banana');
      await clickButton(list, 'OK');
      expect(wrapper.emitted('update:modelValue')).toEqual([[[2]]]);
    });

    it('selects all and clears', async () => {
      const wrapper = mountMultiSelectBox({ modelValue: [], items: fruits });
      const list = await openList(wrapper);
      await clickButton(list, 'Select all');
      await clickButton(list, 'OK');
      expect(wrapper.emitted('update:modelValue')).toEqual([[['apple', 'banana']]]);

      await wrapper.setProps({ modelValue: ['apple', 'banana'] });
      const reopened = await openList(wrapper);
      await clickButton(reopened, 'Clear');
      await clickButton(reopened, 'OK');
      expect(wrapper.emitted('update:modelValue')![1]).toEqual([[]]);
    });

    it('uses buttonLabels and buttonClass for the buttons', async () => {
      const wrapper = mountMultiSelectBox({
        modelValue: [],
        items: fruits,
        buttonLabels: { ok: '決定' },
        buttonClass: 'btn'
      });
      const list = await openList(wrapper);
      const buttons = Array.from(list.querySelectorAll('button'));
      expect(buttons.map(b => b.textContent?.trim())).toEqual(['決定', 'Select all', 'Clear', 'Close']);
      expect(buttons.every(b => b.classList.contains('btn'))).toBe(true);
    });
  });

  describe('groups', () => {
    const items = [
      {
        value: 'all',
        label: 'First'
      },
      {
        optGroup: 'Fruits',
        children: fruits
      }
    ];

    it('unchecks the items of the group when the item above them is checked', async () => {
      const wrapper = mountMultiSelectBox({ modelValue: ['apple'], items });
      const list = await openList(wrapper);
      await checkItem(list, 'First');
      await clickButton(list, 'OK');
      expect(wrapper.emitted('update:modelValue')).toEqual([[['all']]]);
    });

    it('unchecks the item above when an item of the group is checked', async () => {
      const wrapper = mountMultiSelectBox({ modelValue: ['all'], items });
      const list = await openList(wrapper);
      await checkItem(list, 'Banana');
      await clickButton(list, 'OK');
      expect(wrapper.emitted('update:modelValue')).toEqual([[['banana']]]);
    });

    it('selects only the items of the groups with Select all when both kinds are mixed', async () => {
      const wrapper = mountMultiSelectBox({ modelValue: [], items });
      const list = await openList(wrapper);
      await clickButton(list, 'Select all');
      await clickButton(list, 'OK');
      expect(wrapper.emitted('update:modelValue')).toEqual([[['apple', 'banana']]]);
    });
  });

  describe('error state', () => {
    it('shows the error on the textarea', async () => {
      const errorObserver = reactive<ValidationError>({});
      const wrapper = mountMultiSelectBox({ modelValue: [], items: fruits, vid: 'fruits' }, { errorObserver });
      errorObserver.fruits = [{ code: 'code.W001' }];
      await nextTick();
      expect(textArea(wrapper).classList).toContain('dwui-error');
    });
  });

  describe('expose', () => {
    it('getInstance returns the textarea and getCurrentValue returns modelValue', () => {
      const wrapper = mountMultiSelectBox({ modelValue: ['apple'], items: fruits });
      expect(wrapper.vm.getInstance()).toBe(textArea(wrapper));
      expect(wrapper.vm.getCurrentValue()).toEqual(['apple']);
    });

    it('fireChange emits update:modelValue and emit:change with modelValue', () => {
      const wrapper = mountMultiSelectBox({ modelValue: ['apple'], items: fruits });
      wrapper.vm.fireChange();
      expect(wrapper.emitted('update:modelValue')).toEqual([[['apple']]]);
      expect(wrapper.emitted('emit:change')).toEqual([[['apple']]]);
    });

    it('setFocus focuses the textarea', () => {
      const wrapper = mountMultiSelectBox({ modelValue: [], items: fruits });
      wrapper.vm.setFocus();
      expect(document.activeElement).toBe(textArea(wrapper));
    });
  });
});
