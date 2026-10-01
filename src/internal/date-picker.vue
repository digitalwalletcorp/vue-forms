<!--
日付・時刻の選択(InputDateのドロップダウンの中身)
書式が日付を含む場合はカレンダー、時刻を含む場合は時・分・秒の選択を表示する
-->
<template>
  <div class="dwui-date-picker">
    <div
      v-if="showCalendar"
      class="dwui-date-picker-calendar"
    >
      <div class="dwui-date-picker-header">
        <div class="dwui-date-picker-title">
          <span>{{ title }}</span>
          <button
            type="button"
            class="dwui-date-picker-nav"
            aria-label="Select a month"
            @click="showMonthPanel = !showMonthPanel"
          >
            <SvgTriangleButton />
          </button>
          <div
            v-show="showMonthPanel"
            class="dwui-date-picker-month-panel"
          >
            <button
              v-for="(name, idx) in monthNames"
              :key="name"
              type="button"
              :class="{ 'dwui-date-picker-month-current': idx + 1 === shownMonth.month }"
              @click="onClickMonth(idx + 1)"
            >
              {{ name }}
            </button>
          </div>
        </div>
        <div class="dwui-date-picker-navs">
          <button
            type="button"
            class="dwui-date-picker-nav"
            aria-label="Previous year"
            @click="onClickMove(-12)"
          >
            <SvgChevronDouble
              :size="12"
              direction="left"
            />
          </button>
          <button
            type="button"
            class="dwui-date-picker-nav"
            aria-label="Previous month"
            @click="onClickMove(-1)"
          >
            <SvgChevron
              :size="12"
              direction="left"
            />
          </button>
          <button
            type="button"
            class="dwui-date-picker-nav dwui-date-picker-nav-today"
            aria-label="This month"
            @click="onClickThisMonth"
          >
            <SvgDot :size="12" />
          </button>
          <button
            type="button"
            class="dwui-date-picker-nav"
            aria-label="Next month"
            @click="onClickMove(1)"
          >
            <SvgChevron
              :size="12"
              direction="right"
            />
          </button>
          <button
            type="button"
            class="dwui-date-picker-nav"
            aria-label="Next year"
            @click="onClickMove(12)"
          >
            <SvgChevronDouble
              :size="12"
              direction="right"
            />
          </button>
        </div>
      </div>
      <div class="dwui-date-picker-content">
        <div class="dwui-date-picker-week">
          <div
            v-for="(name, idx) in weekNames"
            :key="name"
            :class="{ 'dwui-date-picker-sunday': idx === 0, 'dwui-date-picker-saturday': idx === 6 }"
          >
            {{ name }}
          </div>
        </div>
        <div class="dwui-date-picker-days">
          <button
            v-for="item in days"
            :key="item.date"
            type="button"
            :title="item.holiday?.name"
            :class="{
              'dwui-date-picker-out-of-range': item.outOfRange,
              'dwui-date-picker-today': item.today,
              'dwui-date-picker-selected': item.selected,
              'dwui-date-picker-sunday': item.weekday === 0,
              'dwui-date-picker-saturday': item.weekday === 6,
              'dwui-date-picker-holiday': item.holiday && !item.holiday.regional,
              'dwui-date-picker-regional-holiday': item.holiday?.regional
            }"
            @click="emit('emit:selectDay', item.date)"
          >
            {{ item.day }}
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="showTime"
      class="dwui-date-picker-time"
    >
      <template
        v-for="unit in timeUnits"
        :key="unit.unit"
      >
        <select
          :value="currentTime(unit.token)"
          @change="emit('emit:changeTime', unit.unit, ($event.target as HTMLSelectElement).value)"
        >
          <!-- 未入力を表す選択肢。値を空にすると、00を選んだときにchangeが発火する -->
          <option value="">--</option>
          <option
            v-for="value in unit.values"
            :key="value"
            :value="value"
          >
            {{ value }}
          </option>
        </select>
        <span>{{ unit.label }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { SvgChevron, SvgChevronDouble, SvgDot, SvgTriangleButton } from '@digitalwalletcorp/vue-svg-icons';
import type { InputDateHoliday } from '@/input-date-options';
import { addMonths, calendarDays, formatYmd, today, toYmd } from '@/internal/date';
import type { Ymd } from '@/internal/date';

type TimeUnit = 'hour' | 'minute' | 'second';

interface Props {
  /** 選択中の値。区切り文字を除いた数字の並び */
  modelValue?: string | null;
  /** 表示用の書式(yyyy-MM-dd HH:mm:ss など) */
  dateFormat: string;
  /** 「今日」の基準にするIANAのタイムゾーン名。未指定ならブラウザのローカル時刻 */
  timezone?: string;
  /** 指定した年月の祝日を返す。未指定なら祝日を表示しない */
  fetchHolidays?: (year: number, month: number) => Promise<InputDateHoliday[]>;
}
const props = defineProps<Props>();

interface Emits {
  (e: 'emit:selectDay', value: string): void;
  (e: 'emit:changeTime', unit: TimeUnit, value: string): void;
}
const emit = defineEmits<Emits>();

const { locale } = useI18n();

const todayYmd = today(props.timezone);
const showMonthPanel = ref(false);
const holidays = ref<Record<string, InputDateHoliday>>({});
// 祝日の取得が重なったときに、古い月の結果で上書きしないための番号
let holidayRequest = 0;

const plainFormat = computed(() => props.dateFormat.replace(/[^yMdHmsS]/g, ''));
const showCalendar = computed(() => /[yMd]/.test(props.dateFormat));
const showTime = computed(() => /[Hms]/.test(props.dateFormat));

/** 表示中の月。選択中の値があればその月、なければ今月 */
const shownMonth = ref<Ymd>(toYmd(props.modelValue, plainFormat.value, todayYmd) ?? todayYmd);

const title = computed(() => {
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(shownMonth.value.year, shownMonth.value.month - 1, 1)));
});

const monthNames = computed(() => {
  const format = new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    timeZone: 'UTC'
  });
  return Array.from({ length: 12 }, (_, i) => format.format(new Date(Date.UTC(2000, i, 1))));
});

const weekNames = computed(() => {
  const format = new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    timeZone: 'UTC'
  });
  // 2000-01-02は日曜
  return Array.from({ length: 7 }, (_, i) => format.format(new Date(Date.UTC(2000, 0, 2 + i))));
});

const days = computed(() => {
  const selected = toYmd(props.modelValue, plainFormat.value, todayYmd);
  const selectedDate = selected ? formatYmd(selected) : '';
  const todayDate = formatYmd(todayYmd);
  return calendarDays(shownMonth.value.year, shownMonth.value.month).map(({ ymd, weekday, outOfRange }) => {
    const date = formatYmd(ymd);
    return {
      date,
      day: ymd.day,
      weekday,
      outOfRange,
      today: date === todayDate,
      selected: date === selectedDate,
      holiday: holidays.value[`${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`]
    };
  });
});

const timeUnits = computed(() => {
  const names = new Intl.DisplayNames(locale.value, { type: 'dateTimeField' });
  const values = (count: number) => Array.from({ length: count }, (_, i) => String(i).padStart(2, '0'));
  const units: { unit: TimeUnit; token: string; values: string[] }[] = [
    {
      unit: 'hour',
      token: 'HH',
      values: values(24)
    },
    {
      unit: 'minute',
      token: 'mm',
      values: values(60)
    },
    {
      unit: 'second',
      token: 'ss',
      values: values(60)
    }
  ];
  return units
    .filter(unit => plainFormat.value.includes(unit.token))
    .map(unit => ({
      ...unit,
      label: names.of(unit.unit) ?? unit.unit
    }));
});

const onClickMonth = (month: number) => {
  moveTo({
    ...shownMonth.value,
    month,
    day: 1
  });
};

const onClickMove = (months: number) => {
  moveTo(addMonths(shownMonth.value, months));
};

const onClickThisMonth = () => {
  moveTo(todayYmd);
};

/**
 * 表示する月を変え、その月の祝日を取得する
 *
 * @param {Ymd} ymd
 */
const moveTo = (ymd: Ymd) => {
  shownMonth.value = ymd;
  showMonthPanel.value = false;
  void loadHolidays();
};

/**
 * 表示中の月の祝日を取得する
 * 取得に失敗した場合は祝日を表示しない。祝日は補助的な表示のため、日付の選択は止めない
 */
const loadHolidays = async () => {
  if (!props.fetchHolidays || !showCalendar.value) {
    return;
  }
  const request = ++holidayRequest;
  const { year, month } = shownMonth.value;
  try {
    const result = await props.fetchHolidays(year, month);
    if (request === holidayRequest) {
      holidays.value = Object.fromEntries(result.map(holiday => [holiday.date, holiday]));
    }
  } catch {
    if (request === holidayRequest) {
      holidays.value = {};
    }
  }
};

/**
 * 選択中の値から、時・分・秒のいずれかを返す
 * 日付だけが入力されている場合などで数字になっていない位置は、未入力を表す空文字にする
 *
 * @param {string} token HH / mm / ss
 * @returns {string}
 */
const currentTime = (token: string): string => {
  const index = plainFormat.value.indexOf(token);
  const time = props.modelValue?.substring(index, index + 2) ?? '';
  return /^\d{2}$/.test(time) ? time : '';
};

onMounted(() => {
  void loadHolidays();
});
</script>

<style>
:where(.dwui-date-picker) {
  padding: 4px;
  background: var(--dwui-background-date-picker, light-dark(#ffffff, #2d2f34));
  color: var(--dwui-color-text-date-picker, light-dark(#000000, #e6e6e6));
  font-size: 12px;
}

:where(.dwui-date-picker-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px;
}

:where(.dwui-date-picker-title) {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
}

:where(.dwui-date-picker-navs) {
  display: flex;
  gap: 2px;
}

/* 移動のボタンはアイコンだけを見せる */
:where(.dwui-date-picker-nav) {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
}

:where(.dwui-date-picker-nav-today) {
  color: var(--dwui-color-date-picker-accent, light-dark(rgb(70, 138, 226), rgb(110, 168, 255)));
}

:where(.dwui-date-picker-month-panel) {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 6px;
  border: 1px solid color-mix(in srgb, var(--dwui-color-text-date-picker, light-dark(#000000, #e6e6e6)) 8%, transparent);
  border-radius: 10px;
  background: var(--dwui-background-date-picker, light-dark(#ffffff, #2d2f34));
  box-shadow: 0 4px 12px color-mix(in srgb, var(--dwui-color-text-date-picker, light-dark(#000000, #e6e6e6)) 18%, transparent);
  font-weight: 400;
}

:where(.dwui-date-picker-month-panel > button) {
  padding: 4px 6px;
  border: 1px solid color-mix(in srgb, var(--dwui-color-text-date-picker, light-dark(#000000, #e6e6e6)) 6%, transparent);
  border-radius: 6px;
  background: color-mix(in srgb, var(--dwui-color-date-picker-accent, light-dark(rgb(70, 138, 226), rgb(110, 168, 255))) 4%, var(--dwui-background-date-picker, light-dark(#ffffff, #2d2f34)));
  color: inherit;
  cursor: pointer;
}

:where(.dwui-date-picker-month-panel > button:hover) {
  border-color: color-mix(in srgb, var(--dwui-color-date-picker-accent, light-dark(rgb(70, 138, 226), rgb(110, 168, 255))) 35%, transparent);
  background: color-mix(in srgb, var(--dwui-color-date-picker-accent, light-dark(rgb(70, 138, 226), rgb(110, 168, 255))) 10%, transparent);
  color: var(--dwui-color-date-picker-accent, light-dark(rgb(70, 138, 226), rgb(110, 168, 255)));
}

/* 表示中の月 */
:where(.dwui-date-picker-month-panel > .dwui-date-picker-month-current) {
  border-color: var(--dwui-color-date-picker-accent, light-dark(rgb(70, 138, 226), rgb(110, 168, 255)));
  background: var(--dwui-color-date-picker-accent, light-dark(rgb(70, 138, 226), rgb(110, 168, 255)));
  color: var(--dwui-background-date-picker, light-dark(#ffffff, #2d2f34));
}

:where(.dwui-date-picker-content) {
  border: 1px solid var(--dwui-color-date-picker-accent, light-dark(rgb(70, 138, 226), rgb(110, 168, 255)));
}

:where(.dwui-date-picker-week) {
  display: grid;
  grid-template-columns: repeat(7, minmax(28px, 1fr));
  border-bottom: 1px solid color-mix(in srgb, var(--dwui-color-text-date-picker, light-dark(#000000, #e6e6e6)) 20%, transparent);
  text-align: center;
}

:where(.dwui-date-picker-days) {
  display: grid;
  grid-template-columns: repeat(7, minmax(28px, 1fr));
  grid-template-rows: repeat(6, 18px);
}

:where(.dwui-date-picker-days > button) {
  padding: 0;
  border: none;
  border-radius: 16px;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

:where(.dwui-date-picker-days > button:hover) {
  opacity: 0.5;
}

:where(.dwui-date-picker-days > .dwui-date-picker-today) {
  background: var(--dwui-background-date-picker-today, light-dark(skyblue, #1e5a7a));
}

:where(.dwui-date-picker-days > .dwui-date-picker-selected) {
  background: var(--dwui-background-date-picker-selected, light-dark(thistle, #6a4c7a));
}

:where(.dwui-date-picker-days > .dwui-date-picker-out-of-range) {
  color: color-mix(in srgb, var(--dwui-color-text-date-picker, light-dark(#000000, #e6e6e6)) 40%, transparent);
}

:where(.dwui-date-picker-week > .dwui-date-picker-sunday, .dwui-date-picker-days > .dwui-date-picker-sunday:not(.dwui-date-picker-out-of-range)) {
  color: var(--dwui-color-text-date-picker-sunday, light-dark(red, #ff7b7b));
}

:where(.dwui-date-picker-week > .dwui-date-picker-saturday, .dwui-date-picker-days > .dwui-date-picker-saturday:not(.dwui-date-picker-out-of-range)) {
  color: var(--dwui-color-text-date-picker-saturday, light-dark(blue, #7aa7ff));
}

:where(.dwui-date-picker-days > .dwui-date-picker-holiday:not(.dwui-date-picker-out-of-range)) {
  color: var(--dwui-color-text-date-picker-holiday, light-dark(red, #ff7b7b));
  font-weight: 700;
}

:where(.dwui-date-picker-days > .dwui-date-picker-regional-holiday:not(.dwui-date-picker-out-of-range)) {
  color: var(--dwui-color-text-date-picker-regional-holiday, light-dark(green, #5fd38d));
  font-weight: 700;
}

:where(.dwui-date-picker-time) {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  padding: 4px;
  border: 1px solid var(--dwui-color-date-picker-accent, light-dark(rgb(70, 138, 226), rgb(110, 168, 255)));
}

:where(.dwui-date-picker-calendar + .dwui-date-picker-time) {
  margin-top: 2px;
}

:where(.dwui-date-picker-nav:focus-visible, .dwui-date-picker-month-panel > button:focus-visible, .dwui-date-picker-days > button:focus-visible) {
  outline: var(--dwui-width-focus-ring, 2px) solid var(--dwui-outline-color-focus-ring, Highlight);
  outline-offset: var(--dwui-offset-focus-ring, 2px);
}
</style>
