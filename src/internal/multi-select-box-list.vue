<!--
複数選択リスト(MultiSelectBoxのドロップダウンの中身)

- 非グループ項目: optGroupではない項目
- グループ項目: optGroupのchildrenの各項目
- 非グループ項目にチェックがされると、その配下にあるグループ項目はすべて解除される
- 非グループ項目のチェックが外れると、その非グループ項目のチェックだけが解除される
- グループ項目のいずれかにチェックがされると、所属する非グループ項目は自動的にチェックが外れる
- グループ項目のいずれかのチェックが外れると、そのグループ項目のチェックだけが解除される
- 「全選択」ボタンは非グループ項目とグループ項目が混在する場合は非グループ項目は選択せず、すべてのグループ項目を選択する
- 「クリア」ボタンは非グループ項目/グループ項目すべての選択を解除する
-->
<template>
  <div class="dwui-multi-select-box-list">
    <div
      v-for="(option, idx) in selectOptions"
      :key="idx"
    >
      <template v-if="isGroup(option)">
        <div
          class="dwui-multi-select-box-group"
          :style="{ 'padding-left': groupMixed ? '1em' : '0' }"
        >
          {{ option.optGroup }}
        </div>
        <div
          v-for="(child, idx2) of option.children"
          :key="idx2"
          :style="{ 'padding-left': groupMixed ? '2em' : '1em' }"
        >
          <MultiInputCheckBox
            :model-value="selections"
            :value="child.value"
            :disabled="child.disabled"
            @update:model-value="onChangeGroupItem($event, child)"
          >
            {{ child.label }}
          </MultiInputCheckBox>
        </div>
      </template>
      <template v-else>
        <MultiInputCheckBox
          :model-value="selections"
          :value="option.value"
          :disabled="option.disabled"
          @update:model-value="onChangeNonGroupItem($event, option)"
        >
          {{ option.label }}
        </MultiInputCheckBox>
      </template>
    </div>
    <div class="dwui-multi-select-box-buttons">
      <button
        type="button"
        :class="props.buttonClass"
        :style="props.buttonStyle"
        @click="onClickOk"
      >
        {{ labels.ok }}
      </button>
      <button
        type="button"
        :class="props.buttonClass"
        :style="props.buttonStyle"
        @click="onClickSelectAll"
      >
        {{ labels.selectAll }}
      </button>
      <button
        type="button"
        :class="props.buttonClass"
        :style="props.buttonStyle"
        @click="onClickClear"
      >
        <SvgWastebasket />
        {{ labels.clear }}
      </button>
      <button
        type="button"
        :class="props.buttonClass"
        :style="props.buttonStyle"
        @click="onClickClose"
      >
        <SvgNegativeSquaredCrossMark />
        {{ labels.close }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import type { ClassValue, StyleValue } from 'vue';
import { SvgNegativeSquaredCrossMark, SvgWastebasket } from '@digitalwalletcorp/vue-svg-icons';
import { resolveLabel } from '@/internal/form-helper';
import MultiInputCheckBox from '@/multi-input-check-box.vue';
import type { GroupValueLabelPair, MultiSelectBoxButtonLabels, NumberModelType, StringModelType, ValueLabelPair } from '@/types/form';

type Item = ValueLabelPair<StringModelType | NumberModelType> | GroupValueLabelPair<StringModelType | NumberModelType>;

interface Props {
  /** 開いた時点の選択値 */
  modelValue: (StringModelType | NumberModelType)[];
  /** 選択肢 */
  items: Item[];
  /** 先頭に空白の選択肢を置かない */
  noBlank?: boolean;
  /** ボタンの文言 */
  buttonLabels?: MultiSelectBoxButtonLabels;
  /** ボタンに付けるclass */
  buttonClass?: ClassValue;
  /** ボタンに付けるstyle */
  buttonStyle?: StyleValue;
}
const props = defineProps<Props>();

interface Emits {
  (e: 'emit:apply', value: (StringModelType | NumberModelType)[]): void;
  (e: 'emit:close'): void;
}
const emit = defineEmits<Emits>();

const selections = ref<(StringModelType | NumberModelType)[]>([]);

const labels = computed(() => ({
  ok: props.buttonLabels?.ok ?? 'OK',
  selectAll: props.buttonLabels?.selectAll ?? 'Select all',
  clear: props.buttonLabels?.clear ?? 'Clear',
  close: props.buttonLabels?.close ?? 'Close'
}));

const groupMixed = computed(() => {
  let withGroup = false;
  let withoutGroup = false;
  for (const option of selectOptions.value) {
    if (isGroup(option)) {
      withGroup = true;
    } else {
      withoutGroup = true;
    }
    if (withGroup && withoutGroup) {
      return true;
    }
  }
  return false;
});

const selectOptions = computed(() => {
  const options = [] as (ValueLabelPair<string, string> | GroupValueLabelPair<string, string>)[];
  if (!props.noBlank) {
    options.push({ value: '', label: '' });
  }
  return props.items.reduce((acc, item) => {
    if (item.visible !== false) {
      if (isGroup(item)) {
        acc.push({
          disabled: item.disabled,
          optGroup: item.optGroup,
          children: item.children.reduce((acc2, child) => {
            if (child.visible !== false) {
              acc2.push({
                value: String(child.value),
                label: resolveLabel(child.label),
                disabled: child.disabled
              });
            }
            return acc2;
          }, [] as ValueLabelPair<string, string>[])
        });
      } else {
        acc.push({
          value: String(item.value),
          label: resolveLabel(item.label),
          disabled: item.disabled
        });
      }
    }
    return acc;
  }, options);
});

/**
 * グループ項目のチェックが変更された場合のイベント
 */
const onChangeGroupItem = (values: (StringModelType | NumberModelType)[], option: ValueLabelPair<string, string>) => {
  if (values.includes(option.value)) {
    // グループ項目のいずれかにチェックがされると、所属する非グループ項目はチェックが外れる
    const parentValue = findParentValue(option);
    selections.value = parentValue == null ? values : values.filter(value => String(value) !== parentValue);
  } else {
    selections.value = values;
  }
};

/**
 * 非グループ項目のチェックが変更された場合のイベント
 */
const onChangeNonGroupItem = (values: (StringModelType | NumberModelType)[], option: ValueLabelPair<string, string>) => {
  if (values.includes(option.value)) {
    // 非グループ項目にチェックがされると、その配下にあるグループ項目はすべて解除される
    const childValues = findChildValues(option);
    selections.value = values.filter(value => !childValues.includes(String(value)));
  } else {
    selections.value = values;
  }
};

const onClickOk = () => {
  emit('emit:apply', selections.value);
  emit('emit:close');
};

const onClickSelectAll = () => {
  selections.value = props.items.reduce((acc, item) => {
    if (isGroup(item)) {
      acc.push(...item.children.map(child => String(child.value)));
    } else if (!groupMixed.value) {
      acc.push(String(item.value));
    }
    return acc;
  }, [] as string[]);
};

const onClickClear = () => {
  selections.value = [];
};

const onClickClose = () => {
  emit('emit:close');
};

// optGroupを持つGroupValueLabelPairか判定するタイプガード
const isGroup = <V, L>(item: ValueLabelPair<V, L> | GroupValueLabelPair<V, L>): item is GroupValueLabelPair<V, L> => 'optGroup' in item;

/**
 * 非グループ項目の「下」に並ぶグループ項目の値をすべて返す
 * 次の非グループ項目が現れるまでが、その非グループ項目の配下になる
 *
 * @param {ValueLabelPair<string, string>} option 非グループ項目
 * @returns {string[]}
 */
const findChildValues = (option: ValueLabelPair<string, string>): string[] => {
  const childValues: string[] = [];
  let found = false;
  for (const item of props.items) {
    if (!isGroup(item)) {
      if (String(item.value) === option.value) {
        found = true;
        continue;
      }
      if (found) {
        break;
      }
    } else if (found) {
      childValues.push(...item.children.map(child => String(child.value)));
    }
  }
  return childValues;
};

/**
 * グループ項目が配下に属している非グループ項目の値を返す。属していなければnull
 *
 * @param {ValueLabelPair<string, string>} option グループ項目
 * @returns {string | null}
 */
const findParentValue = (option: ValueLabelPair<string, string>): string | null => {
  let parentValue: string | null = null;
  for (const item of props.items) {
    if (!isGroup(item)) {
      parentValue = String(item.value);
    } else if (item.children.some(child => String(child.value) === option.value)) {
      return parentValue;
    }
  }
  return null;
};

onBeforeMount(() => {
  // OKを押すまで呼び出し側の値を書き換えないよう、複製して編集する
  selections.value = props.modelValue.map(value => String(value));
});
</script>

<style>
:where(.dwui-multi-select-box-list) {
  max-width: 80vw;
  max-height: 80vh;
  overflow: auto;
  padding: 8px;
}

:where(.dwui-multi-select-box-group) {
  font-weight: 700;
}

:where(.dwui-multi-select-box-buttons) {
  position: sticky;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(4, auto);
  justify-content: start;
  column-gap: 4px;
  margin-top: 16px;
}

:where(.dwui-multi-select-box-buttons > button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25em;
}
</style>
