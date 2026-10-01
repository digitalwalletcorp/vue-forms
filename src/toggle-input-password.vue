<!--
表示を切り替えられるパスワード入力
パスワードを隠す入力(InputPassword)と見える入力(InputText)を切り替える。パスワードの生成ボタンを持つ
-->
<template>
  <div class="dwui-toggle-input-password">
    <InputPassword
      v-if="!showPassword"
      ref="refInputPassword"
      :model-value="props.modelValue"
      :vid="props.vid"
      :index="props.index"
      :allow-type="props.allowType"
      :allow-regexp="props.allowRegexp"
      :id="props.id"
      :name="props.name"
      :placeholder="props.placeholder"
      :maxlength="props.maxlength"
      :readonly="props.readonly"
      :disabled="props.disabled"
      autocomplete="new-password"
      :class="props.inputClass"
      :style="props.inputStyle"
      @update:model-value="onUpdateModelValue"
      @emit:blur="emit('emit:blur', $event)"
      @emit:enter="emit('emit:enter', $event)"
    />
    <InputText
      v-else
      ref="refInputText"
      :model-value="props.modelValue"
      :vid="props.vid"
      :index="props.index"
      :allow-type="props.allowType"
      :allow-regexp="props.allowRegexp"
      :id="props.id"
      :name="props.name"
      :placeholder="props.placeholder"
      :maxlength="props.maxlength"
      :readonly="props.readonly"
      :disabled="props.disabled"
      autocomplete="off"
      :class="props.inputClass"
      :style="props.inputStyle"
      @update:model-value="onUpdateModelValue"
      @emit:blur="emit('emit:blur', String($event ?? ''))"
      @emit:enter="emit('emit:enter', String($event ?? ''))"
    />
    <button
      type="button"
      class="dwui-toggle-input-password-toggle"
      :aria-label="showPassword ? 'Hide password' : 'Show password'"
      @click="onClickToggle"
    >
      <SvgEye :slashed="showPassword" />
    </button>
    <button
      v-if="props.visibleCreateButton"
      type="button"
      class="dwui-toggle-input-password-create"
      :class="props.buttonClass"
      :style="props.buttonStyle"
      :disabled="props.disabled || props.readonly"
      @click="onClickCreatePassword"
    >
      <slot name="create">CREATE</slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ClassValue, StyleValue } from 'vue';
import { SvgEye } from '@digitalwalletcorp/vue-svg-icons';
import InputPassword from '@/input-password.vue';
import InputText from '@/input-text.vue';
import type { AllowType, StringModelType } from '@/types/form';

interface Props {
  /** バリデーションルールのキー。errorObserverからこの入力のエラーを引く */
  vid?: string;
  /** バインド値 */
  modelValue?: string | null;
  /** インデックス番号(ツールチップの添字) */
  index?: number;
  /** 許容種別 */
  allowType?: AllowType;
  /** 許容正規表現 */
  allowRegexp?: string | RegExp | null;
  /** パスワードの生成ボタンを表示する */
  visibleCreateButton?: boolean;
  /** パスワードを生成する関数。未指定なら、数字・英小文字・英大文字・記号をそれぞれ1文字以上含む12文字を生成する */
  createPassword?: () => string;
  /** inputのid。ルートが入れ物のため、属性の引き継ぎではinputに届かない */
  id?: string;
  /** inputのname。ルートが入れ物のため、属性の引き継ぎではinputに届かない */
  name?: string;
  /** inputのplaceholder。ルートが入れ物のため、属性の引き継ぎではinputに届かない */
  placeholder?: string;
  /** inputのmaxlength。ルートが入れ物のため、属性の引き継ぎではinputに届かない */
  maxlength?: number;
  /** inputの読取専用。ルートが入れ物のため、属性の引き継ぎではinputに届かない */
  readonly?: boolean;
  /** inputの非活性。ルートが入れ物のため、属性の引き継ぎではinputに届かない */
  disabled?: boolean;
  /** inputに付けるclass */
  inputClass?: ClassValue;
  /** inputに付けるstyle */
  inputStyle?: StyleValue;
  /** パスワードの生成ボタンに付けるclass */
  buttonClass?: ClassValue;
  /** パスワードの生成ボタンに付けるstyle */
  buttonStyle?: StyleValue;
}
const props = withDefaults(defineProps<Props>(), {
  visibleCreateButton: true
});

interface Emits {
  (e: 'update:modelValue', value: StringModelType): void;
  (e: 'emit:blur', value: StringModelType): void;
  (e: 'emit:enter', value: StringModelType): void;
  (e: 'emit:passwordCreated', value: StringModelType): void;
}
const emit = defineEmits<Emits>();

interface Slots {
  create?(): unknown;
}
defineSlots<Slots>();

const refInputPassword = ref<InstanceType<typeof InputPassword>>();
const refInputText = ref<InstanceType<typeof InputText>>();

const showPassword = ref(false);

/** 既定のパスワードに使う文字の種類。それぞれから1文字以上を含める */
const PASSWORD_CHAR_SETS = [
  '0123456789',
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '!@#$%^&*-_=+?'
];
/** 既定のパスワードの長さ */
const PASSWORD_LENGTH = 12;

const onUpdateModelValue = (value: string | number | null) => {
  emit('update:modelValue', String(value ?? ''));
};

const onClickToggle = () => {
  showPassword.value = !showPassword.value;
};

const onClickCreatePassword = () => {
  const password = (props.createPassword ?? createRandomPassword)();
  emit('update:modelValue', password);
  emit('emit:passwordCreated', password);
};

/**
 * 0以上max未満の整数をランダムに返す
 * パスワードに使うため、Math.randomではなく暗号論的に安全な乱数を使う
 *
 * @param {number} max
 * @returns {number}
 */
const randomInt = (max: number): number => {
  return crypto.getRandomValues(new Uint32Array(1))[0]! % max;
};

/**
 * 既定のパスワードを生成する
 * 各文字の種類から1文字ずつ選び、残りを全種類の文字から選んだうえで並べ替える
 *
 * @returns {string}
 */
const createRandomPassword = (): string => {
  const allChars = PASSWORD_CHAR_SETS.join('');
  const chars = PASSWORD_CHAR_SETS.map(set => set.charAt(randomInt(set.length)));
  while (chars.length < PASSWORD_LENGTH) {
    chars.push(allChars.charAt(randomInt(allChars.length)));
  }
  // Fisher-Yates(フィッシャー・イェーツ)シャッフル
  for (let i = chars.length - 1; 0 < i; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join('');
};

/**
 * 表示中の入力(InputPasswordまたはInputText)のINPUTエレメントを返す
 *
 * @returns {HTMLInputElement | undefined}
 */
const currentInput = (): HTMLInputElement | undefined => {
  return (refInputPassword.value ?? refInputText.value)?.getInstance();
};

defineExpose({
  /**
   * 表示中のINPUTエレメントを返す
   */
  getInstance: (): HTMLInputElement | undefined => {
    return currentInput();
  },
  /**
   * 表示中のINPUTエレメントにFocusを設定する
   */
  setFocus: (): void => {
    currentInput()!.focus();
  },
  /**
   * 表示中のINPUTエレメントのBlurイベントを発火する
   */
  fireBlur: (): void => {
    (refInputPassword.value ?? refInputText.value)?.fireBlur();
  },
  /**
   * 現在の設定値を返す
   *
   * @returns {string}
   */
  getCurrentValue: (): string => {
    return currentInput()!.value;
  }
});
</script>

<style>
:where(.dwui-toggle-input-password) {
  display: inline-flex;
  align-items: center;
  gap: var(--dwui-gap-toggle-input-password, 2px);
}

/* 表示の切り替えはアイコンだけを見せる。ボタンの枠や背景は付けない */
:where(.dwui-toggle-input-password-toggle) {
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  line-height: 0;
  cursor: pointer;
}

:where(.dwui-toggle-input-password-toggle:focus-visible, .dwui-toggle-input-password-create:focus-visible) {
  outline: var(--dwui-width-focus-ring, 2px) solid var(--dwui-outline-color-focus-ring, Highlight);
  outline-offset: var(--dwui-offset-focus-ring, 2px);
}
</style>
