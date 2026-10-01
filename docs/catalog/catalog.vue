<!--
部品カタログ
vue-formsの全部品を種別ごとに並べ、操作して表示・動作を確認する。GitHub Pagesでデモとして公開する
-->
<template>
  <div class="showcase">
    <header class="head">
      <p class="eyebrow">
        Components
      </p>
      <h1>vue-forms Catalog</h1>
      <div class="lede">
        <SvgRoundPushpin />
        <span>Operate each component to see how it behaves. The line below each component shows the bound variable of v-model and its current value.</span>
      </div>
      <div class="lede">
        <SvgRoundPushpin />
        <span>Validate checks that every component has a value, and shows the errors with a tooltip on each component.</span>
      </div>
      <div class="lede">
        <SvgRoundPushpin />
        <span>Switching the language changes the labels, the options, and the error messages, which are given as functions that return translated text.</span>
      </div>
    </header>

    <!-- 縦に長いため、操作列はスクロールしても上に残す。帯はページの背景色で、下を流れる内容を隠す -->
    <div class="control-bar">
      <div class="controls">
        <span class="choices">
          Theme
          <label>
            <input
              v-model="theme"
              type="radio"
              value="auto"
              @change="onChangeTheme"
            >
            Auto
          </label>
          <label>
            <input
              v-model="theme"
              type="radio"
              value="light"
              @change="onChangeTheme"
            >
            Light
          </label>
          <label>
            <input
              v-model="theme"
              type="radio"
              value="dark"
              @change="onChangeTheme"
            >
            Dark
          </label>
        </span>
        <span class="choices">
          Language
          <label>
            <input
              v-model="locale"
              type="radio"
              value="en"
            >
            English
          </label>
          <label>
            <input
              v-model="locale"
              type="radio"
              value="ja"
            >
            日本語
          </label>
        </span>
        <button
          type="button"
          @click="onClickValidate"
        >
          {{ t('catalog.validate') }}
        </button>
        <button
          type="button"
          @click="onClickClear"
        >
          {{ t('catalog.clear') }}
        </button>
      </div>
    </div>

    <!-- 各部品のドキュメントから、最初の項目へidで直接飛べるようにしている -->
    <section class="group">
      <h2 class="title">
        Text and number
      </h2>
      <div class="grid">
        <div
          id="input-text"
          class="item"
        >
          <div class="label">
            InputText <small>string</small>
          </div>
          <div class="control">
            <InputText
              v-model="form.name"
              vid="name"
            />
          </div>
          <div class="value">
            v-model: <code>form.name</code> = {{ formatValue(form.name) }}
          </div>
          <div class="note">
            Binds the text as it is.
          </div>
        </div>
        <div class="item">
          <div class="label">
            InputText <small>number</small>
          </div>
          <div class="control">
            <InputText
              v-model="form.age"
              vid="age"
              model-type="number"
            />
          </div>
          <div class="value">
            v-model: <code>form.age</code> = {{ formatValue(form.age) }}
          </div>
          <div class="note">
            Accepts digits only, and binds a number. An empty input is bound as null.
          </div>
        </div>
        <div class="item">
          <div class="label">
            InputText <small>comma-digit</small>
          </div>
          <div class="control">
            <InputText
              v-model="form.amount"
              vid="amount"
              model-type="comma-digit"
            />
          </div>
          <div class="value">
            v-model: <code>form.amount</code> = {{ formatValue(form.amount) }}
          </div>
          <div class="note">
            Shows the number with thousands separators, and binds it without them.
          </div>
        </div>
        <div class="item">
          <div class="label">
            InputText <small>allow-type=alphanum</small>
          </div>
          <div class="control">
            <InputText
              v-model="form.code"
              vid="code"
              allow-type="alphanum"
            />
          </div>
          <div class="value">
            v-model: <code>form.code</code> = {{ formatValue(form.code) }}
          </div>
          <div class="note">
            Characters other than letters and digits are removed as they are typed.
          </div>
        </div>
        <div
          id="input-password"
          class="item"
        >
          <div class="label">
            InputPassword
          </div>
          <div class="control">
            <InputPassword
              v-model="form.password"
              vid="password"
              autocomplete="new-password"
            />
          </div>
          <div class="value">
            v-model: <code>form.password</code> = {{ formatValue(form.password) }}
          </div>
          <div class="note">
            Filters what is typed in the same way as InputText.
          </div>
        </div>
        <div
          id="toggle-input-password"
          class="item"
        >
          <div class="label">
            ToggleInputPassword
          </div>
          <div class="control">
            <ToggleInputPassword
              v-model="form.newPassword"
              vid="newPassword"
            />
          </div>
          <div class="value">
            v-model: <code>form.newPassword</code> = {{ formatValue(form.newPassword) }}
          </div>
          <div class="note">
            The eye button shows and hides the text. CREATE fills in a generated password.
          </div>
        </div>
        <div
          id="input-number"
          class="item"
        >
          <div class="label">
            InputNumber <small>min=0 max=999 scale=2</small>
          </div>
          <div class="control">
            <InputNumber
              v-model="form.quantity"
              vid="quantity"
              :min="0"
              :max="999"
              :scale="2"
            />
          </div>
          <div class="value">
            v-model: <code>form.quantity</code> = {{ formatValue(form.quantity) }}
          </div>
          <div class="note">
            The value is settled on blur, corrected into the range and to two decimal places.
          </div>
        </div>
        <div
          id="text-area"
          class="item"
        >
          <div class="label">
            TextArea <small>maxlength=20</small>
          </div>
          <div class="control">
            <TextArea
              v-model="form.note"
              vid="note"
              :maxlength="20"
              :rows="3"
            />
          </div>
          <div class="value">
            v-model: <code>form.note</code> = {{ formatValue(form.note) }}
          </div>
          <div class="note">
            Highlighted when the text reaches the maximum length.
          </div>
        </div>
      </div>
    </section>

    <section class="group">
      <h2 class="title">
        Selection
      </h2>
      <div class="grid">
        <div
          id="select-box"
          class="item"
        >
          <div class="label">
            SelectBox <small>string</small>
          </div>
          <div class="control">
            <SelectBox
              v-model="form.currency"
              vid="currency"
              :items="currencies"
            />
          </div>
          <div class="value">
            v-model: <code>form.currency</code> = {{ formatValue(form.currency) }}
          </div>
          <div class="note">
            A blank option is placed first.
          </div>
        </div>
        <div class="item">
          <div class="label">
            SelectBox <small>number</small>
          </div>
          <div class="control">
            <SelectBox
              v-model="form.priority"
              vid="priority"
              model-type="number"
              :items="priorities"
            />
          </div>
          <div class="value">
            v-model: <code>form.priority</code> = {{ formatValue(form.priority) }}
          </div>
          <div class="note">
            Binds the selected value as a number, and the blank option as null.
          </div>
        </div>
        <div class="item">
          <div class="label">
            SelectBox <small>group</small>
          </div>
          <div class="control">
            <SelectBox
              v-model="form.city"
              vid="city"
              :items="cities"
            />
          </div>
          <div class="value">
            v-model: <code>form.city</code> = {{ formatValue(form.city) }}
          </div>
          <div class="note">
            Items with optGroup are shown as option groups.
          </div>
        </div>
        <div
          id="multi-select-box"
          class="item"
        >
          <div class="label">
            MultiSelectBox <small>flat</small>
          </div>
          <div class="control">
            <MultiSelectBox
              v-model="form.languages"
              vid="languages"
              :items="languages"
              line-feed
              :rows="3"
            />
          </div>
          <div class="value">
            v-model: <code>form.languages</code> = {{ formatValue(form.languages) }}
          </div>
          <div class="note">
            Click the box to open the list. The selection is applied with OK.
          </div>
        </div>
        <div class="item">
          <div class="label">
            MultiSelectBox <small>group</small>
          </div>
          <div class="control">
            <MultiSelectBox
              v-model="form.areas"
              vid="areas"
              :items="areas"
              :cols="30"
            />
          </div>
          <div class="value">
            v-model: <code>form.areas</code> = {{ formatValue(form.areas) }}
          </div>
          <div class="note">
            Checking an area clears the cities below it, and checking a city clears its area.
          </div>
        </div>
      </div>
    </section>

    <section class="group">
      <h2 class="title">
        Date and time
      </h2>
      <div class="grid">
        <div
          id="input-date"
          class="item"
        >
          <div class="label">
            InputDate <small>date</small>
          </div>
          <div class="control">
            <InputDate
              v-model="form.birthday"
              vid="birthday"
              format-type="date"
              calendar
            />
          </div>
          <div class="value">
            v-model: <code>form.birthday</code> = {{ formatValue(form.birthday) }}
          </div>
          <div class="note">
            Type the digits along the template, or pick a day from the calendar.
          </div>
        </div>
        <div class="item">
          <div class="label">
            InputDate <small>datetime</small>
          </div>
          <div class="control">
            <InputDate
              v-model="form.meetingAt"
              vid="meetingAt"
              format-type="datetime"
              calendar
            />
          </div>
          <div class="value">
            v-model: <code>form.meetingAt</code> = {{ formatValue(form.meetingAt) }}
          </div>
          <div class="note">
            The picker shows the calendar and the time selection together.
          </div>
        </div>
        <div class="item">
          <div class="label">
            InputDate <small>hourMinute</small>
          </div>
          <div class="control">
            <InputDate
              v-model="form.alarm"
              vid="alarm"
              format-type="hourMinute"
              calendar
            />
          </div>
          <div class="value">
            v-model: <code>form.alarm</code> = {{ formatValue(form.alarm) }}
          </div>
          <div class="note">
            The picker shows the time selection only.
          </div>
        </div>
        <div class="item">
          <div class="label">
            InputDate <small>yearMonth</small>
          </div>
          <div class="control">
            <InputDate
              v-model="form.month"
              vid="month"
              format-type="yearMonth"
            />
          </div>
          <div class="value">
            v-model: <code>form.month</code> = {{ formatValue(form.month) }}
          </div>
          <div class="note">
            Without calendar, only the input is shown. An invalid month shows a message.
          </div>
        </div>
      </div>
    </section>

    <section class="group">
      <h2 class="title">
        Check, radio, and switch
      </h2>
      <div class="grid">
        <div
          id="input-check-box"
          class="item"
        >
          <div class="label">
            InputCheckBox <small>boolean</small>
          </div>
          <div class="control">
            <InputCheckBox
              v-model="form.agreed"
              vid="agreed"
            >
              {{ t('item.agree') }}
            </InputCheckBox>
          </div>
          <div class="value">
            v-model: <code>form.agreed</code> = {{ formatValue(form.agreed) }}
          </div>
          <div class="note">
            Binds true when checked and false when not.
          </div>
        </div>
        <div class="item">
          <div class="label">
            InputCheckBox <small>true-value / false-value</small>
          </div>
          <div class="control">
            <InputCheckBox
              v-model="form.newsletter"
              vid="newsletter"
              true-value="1"
              false-value="0"
            >
              {{ t('item.subscribe') }}
            </InputCheckBox>
          </div>
          <div class="value">
            v-model: <code>form.newsletter</code> = {{ formatValue(form.newsletter) }}
          </div>
          <div class="note">
            Binds '1' when checked and '0' when not.
          </div>
        </div>
        <div
          id="multi-input-check-box"
          class="item"
        >
          <div class="label">
            MultiInputCheckBox
          </div>
          <div class="control checks">
            <MultiInputCheckBox
              v-for="interest in interests"
              :key="interest.value"
              v-model="form.interests"
              vid="interests"
              :value="interest.value"
            >
              {{ t(interest.label) }}
            </MultiInputCheckBox>
          </div>
          <div class="value">
            v-model: <code>form.interests</code> = {{ formatValue(form.interests) }}
          </div>
          <div class="note">
            The checkboxes share one array. Checking adds the value and unchecking removes it.
          </div>
        </div>
        <div
          id="input-radio"
          class="item"
        >
          <div class="label">
            InputRadio
          </div>
          <div class="control checks">
            <InputRadio
              v-for="plan in plans"
              :key="plan.value"
              v-model="form.plan"
              vid="plan"
              name="plan"
              :item="plan"
            />
          </div>
          <div class="value">
            v-model: <code>form.plan</code> = {{ formatValue(form.plan) }}
          </div>
          <div class="note">
            The radios with the same v-model bind the value of the checked one.
          </div>
        </div>
        <div
          id="switch-button"
          class="item"
        >
          <div class="label">
            SwitchButton
          </div>
          <div class="control">
            <SwitchButton
              v-model="form.notification"
              vid="notification"
              :label-on="t('item.on')"
              :label-off="t('item.off')"
            />
          </div>
          <div class="value">
            v-model: <code>form.notification</code> = {{ formatValue(form.notification) }}
          </div>
          <div class="note">
            Binds a boolean. Validate fails while it is off.
          </div>
        </div>
      </div>
    </section>

    <section class="group">
      <h2 class="title">
        File
      </h2>
      <div class="grid">
        <div
          id="input-file"
          class="item"
        >
          <div class="label">
            InputFile <small>multiple</small>
          </div>
          <div class="control">
            <InputFile
              v-model="form.attachments"
              vid="attachments"
              multiple
            />
          </div>
          <div class="value">
            v-model: <code>form.attachments</code> = {{ formatValue(form.attachments) }}
          </div>
          <div class="note">
            Binds the selected files as a FileList, and null when none is selected.
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { SvgRoundPushpin } from '@digitalwalletcorp/vue-svg-icons';
import {
  InputCheckBox,
  InputDate,
  InputFile,
  InputNumber,
  InputPassword,
  InputRadio,
  InputText,
  MultiInputCheckBox,
  MultiSelectBox,
  SelectBox,
  SwitchButton,
  TextArea,
  ToggleInputPassword,
  clearErrors,
  doValidate,
  useErrorObserver
} from '@digitalwalletcorp/vue-forms';
import type { GroupValueLabelPair, ValidationRule, ValueLabelPair } from '@digitalwalletcorp/vue-forms';

const { t, locale } = useI18n({ useScope: 'global' });

const errorObserver = useErrorObserver();

/** ページの配色。autoはブラウザの設定に追随し、light/darkは明示的に切り替える */
const theme = ref<'auto' | 'light' | 'dark'>('auto');

const form = reactive({
  name: '',
  age: null as number | null,
  amount: null as number | null,
  code: '',
  password: '',
  newPassword: '',
  quantity: null as number | null,
  note: '',
  currency: '',
  priority: null as number | null,
  city: '',
  languages: [] as string[],
  areas: [] as string[],
  birthday: '',
  meetingAt: '',
  alarm: '',
  month: '',
  agreed: false,
  newsletter: '0',
  interests: [] as string[],
  plan: '',
  notification: false,
  attachments: null as FileList | null
});

const currencies: ValueLabelPair<string>[] = [
  {
    value: 'JPY',
    label: () => t('item.currency.jpy')
  },
  {
    value: 'USD',
    label: () => t('item.currency.usd')
  }
];

const priorities: ValueLabelPair<number>[] = [
  {
    value: 1,
    label: () => t('item.priority.high')
  },
  {
    value: 2,
    label: () => t('item.priority.middle')
  },
  {
    value: 3,
    label: () => t('item.priority.low')
  }
];

const languages: ValueLabelPair<string>[] = [
  {
    value: 'ja',
    label: () => t('item.language.japanese')
  },
  {
    value: 'en',
    label: () => t('item.language.english')
  },
  {
    value: 'fr',
    label: () => t('item.language.french')
  },
  {
    value: 'de',
    label: () => t('item.language.german')
  }
];

// MultiInputCheckBoxのラベルはスロットで渡すため、ラベルには翻訳キーを持たせてテンプレートで翻訳する
const interests: ValueLabelPair<string, string>[] = [
  {
    value: 'music',
    label: 'item.interest.music'
  },
  {
    value: 'sports',
    label: 'item.interest.sports'
  },
  {
    value: 'travel',
    label: 'item.interest.travel'
  }
];

const plans: ValueLabelPair<string>[] = [
  {
    value: 'free',
    label: () => t('item.plan.free')
  },
  {
    value: 'standard',
    label: () => t('item.plan.standard')
  }
];

// 明示指定を<html>のdata-themeへ反映する。autoは属性を外してブラウザの設定に任せる
// optGroupは文字列しか受け取らないため、言語の切り替えで作り直す
const cities = computed((): GroupValueLabelPair<string>[] => [
  {
    optGroup: t('item.area.asia'),
    children: [
      {
        value: 'tokyo',
        label: () => t('item.city.tokyo')
      },
      {
        value: 'osaka',
        label: () => t('item.city.osaka')
      }
    ]
  },
  {
    optGroup: t('item.area.europe'),
    children: [
      {
        value: 'london',
        label: () => t('item.city.london')
      },
      {
        value: 'paris',
        label: () => t('item.city.paris')
      }
    ]
  }
]);

// 地域(非グループ項目)の直後に、その地域の都市(グループ項目)を並べる。並び順が親子関係になる
const areas = computed((): (ValueLabelPair<string> | GroupValueLabelPair<string>)[] => [
  {
    value: 'asia',
    label: () => t('item.area.asia')
  },
  {
    optGroup: t('item.group.asianCities'),
    children: [
      {
        value: 'tokyo',
        label: () => t('item.city.tokyo')
      },
      {
        value: 'osaka',
        label: () => t('item.city.osaka')
      }
    ]
  },
  {
    value: 'europe',
    label: () => t('item.area.europe')
  },
  {
    optGroup: t('item.group.europeanCities'),
    children: [
      {
        value: 'london',
        label: () => t('item.city.london')
      },
      {
        value: 'paris',
        label: () => t('item.city.paris')
      }
    ]
  }
]);

const onChangeTheme = () => {
  if (theme.value === 'auto') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = theme.value;
  }
};

const onClickValidate = () => {
  doValidate(errorObserver, validationRules());
};

const onClickClear = () => {
  clearErrors(errorObserver);
};

/**
 * 全項目の必須チェックのルールを返す
 * ルールの真偽は検証する時点の値で決まるため、検証のたびに作る
 *
 * @returns {Record<string, ValidationRule[]>}
 */
const validationRules = (): Record<string, ValidationRule[]> => {
  const rules: Record<string, ValidationRule[]> = {};
  for (const [key, value] of Object.entries(form)) {
    rules[key] = [
      {
        rule: isEmpty(key, value),
        code: 'message.required',
        bind: [`label.${key}`]
      }
    ];
  }
  return rules;
};

/**
 * 値が未入力かを返す
 * チェックボックスとスイッチは、オフの状態を未入力とみなす
 *
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean}
 */
const isEmpty = (key: string, value: unknown): boolean => {
  if (key === 'newsletter') {
    return value === '0';
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return value == null || value === '' || value === false;
};

/**
 * バインド値を表示用の文字列にする
 * FileListはJSONにすると中身が出ないため、ファイル名を並べる
 *
 * @param {unknown} value
 * @returns {string}
 */
const formatValue = (value: unknown): string => {
  if (value instanceof FileList) {
    return JSON.stringify(Array.from(value, file => file.name));
  }
  return JSON.stringify(value);
};
</script>

<style>
:root {
  --bg-page: #f4f5f7;
  --bg-panel: #ffffff;
  --border: #d9dce1;
  --text: #333c47;
  --text-muted: #6b7280;
  --accent: #0e7490;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-page: #20242b;
    --bg-panel: #272c35;
    --border: #3a414d;
    --text: #d7dce3;
    --text-muted: #8a929c;
    --accent: #67e8f9;
    color-scheme: dark;
  }
}

/* 明示指定はブラウザの設定より優先する(属性セレクタの詳細度がメディアクエリ内の:rootに勝つ) */
:root[data-theme='light'] {
  --bg-page: #f4f5f7;
  --bg-panel: #ffffff;
  --border: #d9dce1;
  --text: #333c47;
  --text-muted: #6b7280;
  --accent: #0e7490;
  color-scheme: light;
}

:root[data-theme='dark'] {
  --bg-page: #20242b;
  --bg-panel: #272c35;
  --border: #3a414d;
  --text: #d7dce3;
  --text-muted: #8a929c;
  --accent: #67e8f9;
  color-scheme: dark;
}

body {
  margin: 0;
  background: var(--bg-page);
  color: var(--text);
  font-family: system-ui, sans-serif;
  font-size: 14px;
}

.showcase {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

.head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.head .eyebrow {
  margin: 0;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.head h1 {
  margin: 0 0 4px;
  font-size: 28px;
  font-weight: 600;
}

.head .lede {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-left: 1em;
  color: var(--text-muted);
  font-size: 13px;
}

.control-bar {
  position: sticky;
  top: 0;
  z-index: 1;
  /* 一覧との間隔(gap)の分だけ帯を広げ、見出しが帯の下端で途切れて見えないようにする */
  margin: -24px 0 -12px;
  padding: 12px 0;
  background: var(--bg-page);
}

.control-bar .controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-panel);
}

.control-bar .choices {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.control-bar .choices label {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.control-bar .choices label:has(input:checked) {
  color: var(--accent);
}

.control-bar button {
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-page);
  color: var(--text);
  font: inherit;
  cursor: pointer;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group .title {
  margin: 0;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
  color: var(--accent);
  font-size: 18px;
  font-weight: 600;
}

.group .grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-panel);
  /* stickyの操作列に隠れないよう、ハッシュで飛んだときの位置を下げる */
  scroll-margin-top: 80px;
}

.item .label {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-weight: 500;
}

.item .label small {
  color: var(--accent);
  font-family: ui-monospace, monospace;
  font-size: 12px;
  font-weight: 400;
}

.item .control {
  display: flex;
  align-items: flex-start;
}

.item .control.checks {
  flex-wrap: wrap;
  gap: 4px 16px;
}

.item .note {
  padding-top: 4px;
  border-top: 1px dashed var(--border);
  color: var(--text-muted);
  font-size: 12px;
}

.item .value {
  font-family: ui-monospace, monospace;
  font-size: 12px;
  word-break: break-all;
}

.item .value code {
  color: var(--accent);
}
</style>
