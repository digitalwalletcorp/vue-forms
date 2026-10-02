import { describe, it, expect, afterEach, vi } from 'vitest';
import { nextTick, reactive } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import InputDate from '@/input-date.vue';
import { errorObserverKey } from '@/error-observer';
import { VueFormsError } from '@/errors';
import { inputDateOptionsKey } from '@/input-date-options';
import type { InputDateOptions } from '@/input-date-options';
import type { ValidationError } from '@/validation';
import { createTestI18n } from '#/helpers/i18n';

type InputDateProps = InstanceType<typeof InputDate>['$props'];

const mounted: ReturnType<typeof mount>[] = [];

const mountInputDate = (props: InputDateProps, options: { attrs?: Record<string, unknown>, errorObserver?: ValidationError, dateOptions?: InputDateOptions } = {}) => {
  const provide: Record<symbol, unknown> = {};
  if (options.errorObserver) {
    provide[errorObserverKey as symbol] = options.errorObserver;
  }
  if (options.dateOptions) {
    provide[inputDateOptionsKey as symbol] = options.dateOptions;
  }
  const wrapper = mount(InputDate, {
    props,
    attrs: options.attrs,
    attachTo: document.body,
    global: {
      plugins: [createTestI18n()],
      provide
    }
  });
  mounted.push(wrapper);
  return wrapper;
};

const input = (wrapper: ReturnType<typeof mountInputDate>): HTMLInputElement => wrapper.find('input').element;

/**
 * ドロップダウンの表示・非表示が描画に反映されるまで待つ
 * floating-vueはタイマーで表示を切り替えるため、Promiseの解決だけでは反映されない
 */
const settle = async () => {
  await new Promise(resolve => setTimeout(resolve, 0));
  await flushPromises();
};

/** ボタンを押して日付・時刻の選択を開き、その要素を返す */
const openPicker = async (wrapper: ReturnType<typeof mountInputDate>): Promise<HTMLElement> => {
  await wrapper.find('.dwui-input-date-button').trigger('click');
  await settle();
  return document.body.querySelector('.dwui-date-picker')!;
};

const dayButton = (picker: HTMLElement, day: number, inRange = true): HTMLButtonElement => {
  return Array.from(picker.querySelectorAll<HTMLButtonElement>('.dwui-date-picker-days > button'))
    .find(button => button.textContent?.trim() === String(day) && button.classList.contains('dwui-date-picker-out-of-range') !== inRange)!;
};

describe('InputDate', () => {
  afterEach(() => {
    mounted.splice(0).forEach(wrapper => wrapper.unmount());
    vi.useRealTimers();
  });

  describe('root element', () => {
    it('renders a div root with the input', () => {
      const wrapper = mountInputDate({ formatType: 'date' });
      expect(wrapper.element.tagName).toBe('DIV');
      expect(wrapper.classes()).toEqual(['dwui-input-date']);
      expect(input(wrapper).value).toBe('____-__-__');
      expect(input(wrapper).size).toBe(12);
    });

    it('puts the input props and parts props on the input', () => {
      const wrapper = mountInputDate({
        formatType: 'date',
        id: 'birthday',
        name: 'birthday',
        placeholder: 'Birthday',
        readonly: true,
        inputClass: 'wide'
      }, { attrs: { class: 'ml4' } });
      expect(wrapper.classes()).toEqual(['dwui-input-date', 'ml4']);
      expect(input(wrapper).id).toBe('birthday');
      expect(input(wrapper).name).toBe('birthday');
      expect(input(wrapper).placeholder).toBe('Birthday');
      expect(input(wrapper).readOnly).toBe(true);
      expect(input(wrapper).classList).toContain('wide');
    });

    it('throws VueFormsError for an unsupported formatType', () => {
      expect(() => mountInputDate({ formatType: 'week' as never })).toThrow(VueFormsError);
    });
  });

  describe('display', () => {
    it.each([
      ['date', '20260930', '2026-09-30'],
      ['time', '123456', '12:34:56'],
      ['datetime', '20260930123456', '2026-09-30 12:34:56'],
      ['dateHourMinute', '202609301234', '2026-09-30 12:34'],
      ['timestamp', '20260930123456789', '2026-09-30 12:34:56.789'],
      ['year', '2026', '2026'],
      ['yearMonth', '202609', '2026-09'],
      ['monthDay', '0930', '09-30'],
      ['hourMinute', '1234', '12:34']
    ] as const)('shows %s in its template', (formatType, modelValue, expected) => {
      const wrapper = mountInputDate({
        formatType,
        modelValue
      });
      expect(input(wrapper).value).toBe(expected);
    });

    it('fills the rest of a partial value with underscores', () => {
      const wrapper = mountInputDate({
        formatType: 'date',
        modelValue: '2026'
      });
      expect(input(wrapper).value).toBe('2026-__-__');
    });
  });

  describe('input', () => {
    it('emits the digits without the separators, keeping underscores for the positions not typed yet', async () => {
      const wrapper = mountInputDate({ formatType: 'date' });
      const element = input(wrapper);
      element.setSelectionRange(0, 0);
      await wrapper.find('input').trigger('keydown', { key: '2' });
      element.value = '2____-__-__';
      element.setSelectionRange(1, 1);
      await wrapper.find('input').trigger('input');
      expect(wrapper.emitted('update:modelValue')).toEqual([['2_______']]);
    });

    it('emits an empty string when every digit is deleted', async () => {
      const wrapper = mountInputDate({
        formatType: 'year',
        modelValue: '2'
      });
      const element = input(wrapper);
      element.setSelectionRange(1, 1);
      await wrapper.find('input').trigger('keydown', { key: 'Backspace' });
      element.value = '___';
      element.setSelectionRange(0, 0);
      await wrapper.find('input').trigger('input');
      expect(wrapper.emitted('update:modelValue')).toEqual([['']]);
    });
  });

  describe('events', () => {
    it('emits emit:blur with the digits, and an empty string for the template only', async () => {
      const wrapper = mountInputDate({
        formatType: 'date',
        modelValue: '20260930'
      });
      await wrapper.find('input').trigger('blur');
      await wrapper.setProps({ modelValue: '' });
      await wrapper.find('input').trigger('blur');
      expect(wrapper.emitted('emit:blur')).toEqual([['20260930'], ['']]);
    });

    it('emits emit:enter with the digits on Enter', async () => {
      const wrapper = mountInputDate({
        formatType: 'date',
        modelValue: '20260930'
      });
      await wrapper.find('input').trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('emit:enter')).toEqual([['20260930']]);
    });
  });

  describe('invalid value', () => {
    it('adds the error class and shows the default message for an invalid date', () => {
      const wrapper = mountInputDate({
        formatType: 'date',
        modelValue: '20260231'
      });
      expect(wrapper.classes()).toContain('dwui-error');
    });

    it.each([
      ['date', '20260231', 'invalid date'],
      ['time', '250000', 'invalid time'],
      ['datetime', '20260930250000', 'invalid format']
    ] as const)('uses the message of the reserved i18n key for %s', async (formatType, modelValue, expected) => {
      const wrapper = mountInputDate({
        formatType,
        modelValue
      });
      // ツールチップの文言はルートのdirectiveに渡る値で確かめる
      expect((wrapper.vm as unknown as { invalidMessage: string }).invalidMessage ?? '').toBe(expected);
    });

    it.each([
      ['date', '20260231', 'Invalid date'],
      ['time', '250000', 'Invalid time'],
      ['datetime', '20260930250000', 'Invalid format']
    ] as const)('falls back to the English message when the i18n key is missing for %s', async (formatType, modelValue, expected) => {
      const wrapper = mount(InputDate, {
        props: {
          formatType,
          modelValue
        },
        global: { plugins: [createI18n({ legacy: false, locale: 'en', messages: { en: {} } })] }
      });
      expect((wrapper.vm as unknown as { invalidMessage: string }).invalidMessage ?? '').toBe(expected);
    });

    it('does not show an error for a valid or empty value', () => {
      expect(mountInputDate({ formatType: 'date', modelValue: '20260930' }).classes()).not.toContain('dwui-error');
      expect(mountInputDate({ formatType: 'date', modelValue: '' }).classes()).not.toContain('dwui-error');
    });

    it('adds the error class while the error observer has an error for the vid', async () => {
      const errorObserver = reactive<ValidationError>({});
      const wrapper = mountInputDate({
        formatType: 'date',
        vid: 'birthday'
      }, { errorObserver });
      errorObserver.birthday = [{ code: 'code.W001' }];
      await nextTick();
      expect(wrapper.classes()).toContain('dwui-error');
    });
  });

  describe('picker button', () => {
    it('wraps the button in the dropdown with its own class, so that the button is not pushed up by the line box', () => {
      const wrapper = mountInputDate({ formatType: 'date', calendar: true });
      expect(wrapper.find('.dwui-input-date > .dwui-input-date-dropdown > .dwui-input-date-button').exists()).toBe(true);
    });

    it.each(['date', 'datetime', 'dateHourMinute', 'timestamp', 'monthDay', 'time', 'hourMinute'] as const)('is shown for %s with calendar', (formatType) => {
      expect(mountInputDate({ formatType, calendar: true }).find('.dwui-input-date-button').exists()).toBe(true);
    });

    it.each(['year', 'yearMonth'] as const)('is not shown for %s', (formatType) => {
      expect(mountInputDate({ formatType, calendar: true }).find('.dwui-input-date-button').exists()).toBe(false);
    });

    it('is not shown without calendar', () => {
      expect(mountInputDate({ formatType: 'date' }).find('.dwui-input-date-button').exists()).toBe(false);
    });

    it('is a disabled button while disabled, and does not open while readonly', async () => {
      const disabled = mountInputDate({ formatType: 'date', calendar: true, disabled: true });
      expect(disabled.find('.dwui-input-date-button').attributes('type')).toBe('button');
      expect(disabled.find('.dwui-input-date-button').attributes('disabled')).toBeDefined();

      const readonly = mountInputDate({ formatType: 'date', calendar: true, readonly: true });
      expect(await openPicker(readonly)).toBeNull();
    });
  });

  describe('calendar', () => {
    it('opens the calendar of the month of the value and selects a day', async () => {
      const wrapper = mountInputDate({
        formatType: 'date',
        calendar: true,
        modelValue: '20260910'
      });
      const picker = await openPicker(wrapper);
      expect(picker.querySelector('.dwui-date-picker-selected')?.textContent?.trim()).toBe('10');

      dayButton(picker, 15).click();
      await settle();
      expect(wrapper.emitted('update:modelValue')).toEqual([['20260915']]);
      expect(wrapper.emitted('emit:selectDay')).toEqual([['20260915']]);
      // v-modelと同じく、親が値を更新したあとの表示を確かめる
      await wrapper.setProps({ modelValue: '20260915' });
      expect(input(wrapper).value).toBe('2026-09-15');
    });

    it('keeps the time and fills the missing time with zeros for datetime', async () => {
      // 値が書式より短く日付として読めないため、表示する月は今日で決まる
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-09-15T00:00:00Z'));
      const wrapper = mountInputDate({
        formatType: 'datetime',
        calendar: true,
        modelValue: '2026091012'
      });
      const picker = await openPicker(wrapper);
      dayButton(picker, 20).click();
      await settle();
      expect(wrapper.emitted('update:modelValue')).toEqual([['20260920120000']]);
    });

    it('emits only the month and day for monthDay', async () => {
      const wrapper = mountInputDate({
        formatType: 'monthDay',
        calendar: true,
        modelValue: '0910'
      });
      const picker = await openPicker(wrapper);
      dayButton(picker, 3).click();
      await settle();
      expect(wrapper.emitted('update:modelValue')).toEqual([['0903']]);
    });

    it('moves the shown month and highlights today in the time zone of the options', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-09-30T20:00:00Z'));
      const wrapper = mountInputDate({
        formatType: 'date',
        calendar: true
      }, { dateOptions: { timezone: 'Asia/Tokyo' } });
      const picker = await openPicker(wrapper);
      // 東京では2026-10-01
      expect(picker.querySelector('.dwui-date-picker-today')?.textContent?.trim()).toBe('1');
      const title = () => picker.querySelector('.dwui-date-picker-title > span')!.textContent;
      const before = title();
      (picker.querySelector('[aria-label="Next month"]') as HTMLButtonElement).click();
      await settle();
      expect(title()).not.toBe(before);
    });

    it('shows the holidays given by the options', async () => {
      const fetchHolidays = vi.fn(async () => [
        {
          date: '2026-09-21',
          name: 'Respect for the Aged Day'
        },
        {
          date: '2026-09-22',
          name: 'Local holiday',
          regional: true
        }
      ]);
      const wrapper = mountInputDate({
        formatType: 'date',
        calendar: true,
        modelValue: '20260910'
      }, { dateOptions: { fetchHolidays } });
      const picker = await openPicker(wrapper);
      await settle();
      expect(fetchHolidays).toHaveBeenCalledWith(2026, 9);
      expect(dayButton(picker, 21).classList).toContain('dwui-date-picker-holiday');
      expect(dayButton(picker, 21).title).toBe('Respect for the Aged Day');
      expect(dayButton(picker, 22).classList).toContain('dwui-date-picker-regional-holiday');
    });

    it('shows no holidays when fetching them fails', async () => {
      const wrapper = mountInputDate({
        formatType: 'date',
        calendar: true,
        modelValue: '20260910'
      }, { dateOptions: { fetchHolidays: async () => Promise.reject(new Error('failed')) } });
      const picker = await openPicker(wrapper);
      await settle();
      expect(picker.querySelector('.dwui-date-picker-holiday')).toBeNull();
      expect(dayButton(picker, 21)).toBeDefined();
    });

    it('prefers the props to the provided options', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-09-30T20:00:00Z'));
      const providedFetch = vi.fn(async () => []);
      const propsFetch = vi.fn(async () => [{
        date: '2026-10-10',
        name: 'Sports Day'
      }]);
      const wrapper = mountInputDate({
        formatType: 'date',
        calendar: true,
        timezone: 'Pacific/Honolulu',
        fetchHolidays: propsFetch
      }, {
        dateOptions: {
          timezone: 'Asia/Tokyo',
          fetchHolidays: providedFetch
        }
      });
      const picker = await openPicker(wrapper);
      await settle();
      // ホノルルでは2026-09-30
      expect(picker.querySelector('.dwui-date-picker-today')?.textContent?.trim()).toBe('30');
      expect(propsFetch).toHaveBeenCalledWith(2026, 9);
      expect(providedFetch).not.toHaveBeenCalled();
    });
  });

  describe('time picker', () => {
    it('shows the selects of the units in the format and emits the changed time', async () => {
      const wrapper = mountInputDate({
        formatType: 'hourMinute',
        calendar: true,
        modelValue: '0930'
      });
      const picker = await openPicker(wrapper);
      const selects = picker.querySelectorAll<HTMLSelectElement>('.dwui-date-picker-time select');
      expect(selects).toHaveLength(2);
      expect(selects[0]!.value).toBe('09');
      expect(picker.querySelector('.dwui-date-picker-calendar')).toBeNull();

      selects[1]!.value = '45';
      selects[1]!.dispatchEvent(new Event('change'));
      expect(wrapper.emitted('update:modelValue')).toEqual([['0945']]);
    });

    it('shows -- while the time is not entered, and sets 00 when it is selected', async () => {
      const wrapper = mountInputDate({
        formatType: 'dateHourMinute',
        calendar: true,
        modelValue: '20260930'
      });
      const picker = await openPicker(wrapper);
      const selects = picker.querySelectorAll<HTMLSelectElement>('.dwui-date-picker-time select');
      expect(selects).toHaveLength(2);
      expect(Array.from(selects).map(select => select.value)).toEqual(['', '']);
      expect(selects[0]!.options[0]!.textContent).toBe('--');

      selects[0]!.value = '00';
      selects[0]!.dispatchEvent(new Event('change'));
      expect(wrapper.emitted('update:modelValue')).toEqual([['202609300000']]);
    });

    it('fills the time not entered with zeros when a unit is selected, but not the date', async () => {
      const wrapper = mountInputDate({
        formatType: 'timestamp',
        calendar: true,
        modelValue: '2026____'
      });
      const picker = await openPicker(wrapper);
      const selects = picker.querySelectorAll<HTMLSelectElement>('.dwui-date-picker-time select');
      selects[1]!.value = '30';
      selects[1]!.dispatchEvent(new Event('change'));
      expect(wrapper.emitted('update:modelValue')).toEqual([['2026____003000000']]);
    });

    it('clears the unit when -- is selected again', async () => {
      const wrapper = mountInputDate({
        formatType: 'hourMinute',
        calendar: true,
        modelValue: '0930'
      });
      const picker = await openPicker(wrapper);
      const selects = picker.querySelectorAll<HTMLSelectElement>('.dwui-date-picker-time select');
      selects[1]!.value = '';
      selects[1]!.dispatchEvent(new Event('change'));
      expect(wrapper.emitted('update:modelValue')).toEqual([['09__']]);
    });
  });

  describe('expose', () => {
    it('getCurrentValue and fireBlur return an empty string for the template only', () => {
      const wrapper = mountInputDate({ formatType: 'date' });
      expect(wrapper.vm.getCurrentValue()).toBe('');
      wrapper.vm.fireBlur();
      expect(wrapper.emitted('emit:blur')).toEqual([['']]);
    });

    it('getCurrentValue returns the digits of the input', () => {
      const wrapper = mountInputDate({
        formatType: 'datetime',
        modelValue: '20260930123456'
      });
      expect(wrapper.vm.getCurrentValue()).toBe('20260930123456');
    });

    it('setFocus focuses the input and getInstance returns it', () => {
      const wrapper = mountInputDate({ formatType: 'date' });
      wrapper.vm.setFocus();
      expect(document.activeElement).toBe(input(wrapper));
      expect(wrapper.vm.getInstance()).toBe(input(wrapper));
    });
  });
});
