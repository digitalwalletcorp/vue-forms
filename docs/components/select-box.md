#### SelectBox

A drop-down list. It supports option groups, and shows validation errors from the error observer.

```vue
<template>
  <SelectBox
    v-model="form.currency"
    vid="currency"
    :items="currencies"
  />
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { SelectBox } from '@digitalwalletcorp/vue-forms';
import type { ValueLabelPair } from '@digitalwalletcorp/vue-forms';

const { t } = useI18n();

const form = reactive({ currency: '' });

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
</script>
```

[Try it in the demo](https://digitalwalletcorp.github.io/vue-forms/demo/#select-box)

> 💡 **Usage Notes**
> * The root element is the `<select>` itself. Attributes such as `class`, `style`, `id`, `name`, and `disabled` are passed directly through to it.
> * The `label` of each option is shown as it is, or called when it is a function. See [Labels](../../README.md#%EF%B8%8F-labels).
> * A blank option is placed first unless `noBlank` is set.
> * When the error observer has an error for `vid`, the `dwui-error` class is added and the messages are shown in a tooltip on the right. See [Validation](../../README.md#-validation) for how to provide the error observer.

##### 🔧 Props

| Prop         | Type                                          | Description |
| ------------ | --------------------------------------------- | ----------- |
| `modelValue` | `string \| number \| boolean \| null`         | The bound value. When it is `null`, the option whose value is `''` or `null` is selected. |
| `modelType`  | `'string' \| 'number' \| 'boolean'`           | The type of the bound value. Defaults to `'string'`. With `'number'`, the selected value is bound as a number, and the blank option or an option whose value is `''`, `null`, or `'null'` as `null`. With `'boolean'`, an option whose value is `true` or `false` is bound as a boolean, and the other options, including the blank option, as `null`. |
| `items`      | `(ValueLabelPair \| GroupValueLabelPair)[]`   | The options. See [Items](#items). |
| `noBlank`    | `boolean`                                     | Does not place the blank option first. |
| `vid`        | `string`                                      | The key of the validation rules. The errors of this key are shown on this select. |
| `index`      | `number`                                      | The index for rules defined as arrays. Errors are looked up by `` `${vid}[${index}]` `` as well as `vid`. |

##### 📣 Events

| Event               | Payload                               | Description |
| ------------------- | ------------------------------------- | ----------- |
| `update:modelValue` | `string \| number \| boolean \| null` | Emitted when the selection changes. |
| `emit:change`       | `string \| number \| boolean \| null` | Emitted right after `update:modelValue`, with the same value. |

> 💡 The native `change` event of the `<select>` also reaches the root and can be listened to with `@change`, but it gives a DOM `Event`. Listen to `emit:change` to receive the value.

##### 🛠️ Exposed Methods

| Method            | Returns                               | Description |
| ----------------- | ------------------------------------- | ----------- |
| `getInstance`     | `HTMLSelectElement`                   | Returns the select element. |
| `setFocus`        | `void`                                | Focuses the select. |
| `setCurrent`      | `void`                                | Selects the option for the current `modelValue` again. Use it when a `null` value is not reflected. |
| `fireChange`      | `void`                                | Emits `update:modelValue` and `emit:change` with the selected value, converted by `modelType`. |
| `getCurrentValue` | `string \| number \| boolean \| null` | Returns the selected value, converted by `modelType`. |

##### Items

| Property   | Type                                  | Description |
| ---------- | ------------------------------------- | ----------- |
| `value`    | `string \| number \| boolean \| null` | The value of the option. |
| `label`    | `LabelText`                           | The label of the option: a string, or a function that returns a string. |
| `disabled` | `boolean`                             | Makes the option unselectable. |
| `visible`  | `boolean`                             | Hides the option when `false`. |
| `optGroup` | `string`                              | Makes the item a group with this label (`GroupValueLabelPair`). Its options are given by `children`. |
| `children` | `ValueLabelPair[]`                    | The options of the group. |

##### 🎨 Styling

| CSS variable                      | Description |
| --------------------------------- | ----------- |
| `--dwui-background-form-error`    | Background while the select has an error. Defaults to `#fed0e0` in light and `#5c2633` in dark. |
| `--dwui-border-color-form-error`  | Border color while the select has an error. Defaults to `orangered` in light and `#ff7b5c` in dark. |
| `--dwui-color-text-form-error`    | Text color while the select has an error. Defaults to `#000000` in light and `#ffe3ea` in dark. |
| `--dwui-width-focus-ring`         | Width of the focus ring. Defaults to `2px`. |
| `--dwui-outline-color-focus-ring` | Color of the focus ring. Defaults to `Highlight`. |
| `--dwui-offset-focus-ring`        | Offset of the focus ring. Defaults to `2px`. |

> 💡 Set the background and the text color as a pair, so that the text stays readable on the error background in every theme.
