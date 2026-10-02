#### InputRadio

A radio button with a label. It is checked when the bound value matches its item, and shows validation errors from the error observer.

```vue
<template>
  <InputRadio
    v-for="(item, idx) in sortOrders"
    :key="item.value"
    v-model="form.sortOrder"
    vid="sortOrder"
    name="sort-order"
    :item="item"
    :class="{ 'ml4': 0 < idx }"
  />
</template>
```

[Try it in the demo](https://digitalwalletcorp.github.io/vue-forms/demo/#input-radio)

> 💡 **Usage Notes**
> * The root element is a `<div>` wrapping a `<label>`, which contains the `<input type="radio">` and a `<span>` with the label. Clicking the label text checks the radio.
> * Attributes such as `class` and `style` are applied to the root `<div>`. `id`, `name`, and `disabled` are props, because they have to reach the radio inside. Use `inputClass` / `inputStyle` for the radio and `labelClass` / `labelStyle` for the label text.
> * The `label` of the item is shown as it is, or called when it is a function. See [Labels](../../README.md#%EF%B8%8F-labels).
> * When the error observer has an error for `vid`, the `dwui-error` class is added to the root and the messages are shown in a tooltip on the right. No default error style is provided, because browsers draw radio buttons natively. Style it in your application, for example `.dwui-input-radio.dwui-error input`. See [Validation](../../README.md#-validation) for how to provide the error observer.

##### 🔧 Props

| Prop         | Type                                  | Description |
| ------------ | ------------------------------------- | ----------- |
| `item`       | `ValueLabelPair<string>`              | The value and the label (`LabelText`) of this radio. Required. |
| `modelValue` | `string \| number \| boolean \| null` | The bound value. The radio is checked when `String(modelValue)` equals `item.value`. |
| `modelType`  | `'string' \| 'number' \| 'boolean'`   | The type of the bound value. Defaults to `'string'`. With `'number'`, the value is bound as a number, and `''` or `'null'` as `null`. With `'boolean'`, `'true'` and `'false'` are bound as `true` and `false`, and the other values as `null`. |
| `id`         | `string`                              | The id of the radio. |
| `name`       | `string`                              | The name of the radio. Give the same name to the radios of a group. |
| `disabled`   | `boolean`                             | Disables the radio. |
| `inputClass` | `ClassValue`                          | Class for the radio. |
| `inputStyle` | `StyleValue`                          | Style for the radio. |
| `labelClass` | `ClassValue`                          | Class for the `<span>` wrapping the label text. |
| `labelStyle` | `StyleValue`                          | Style for the `<span>` wrapping the label text. |
| `vid`        | `string`                              | The key of the validation rules. The errors of this key are shown on this radio. |
| `index`      | `number`                              | The index for rules defined as arrays. Errors are looked up by `` `${vid}[${index}]` `` as well as `vid`. |

##### 📣 Events

| Event               | Payload                               | Description |
| ------------------- | ------------------------------------- | ----------- |
| `update:modelValue` | `string \| number \| boolean \| null` | Emitted when the radio is checked, with `item.value` converted by `modelType`. |
| `emit:change`       | `string \| number \| boolean \| null` | Emitted right after `update:modelValue`, with the same value. |

> 💡 The native `change` event of the radio also reaches the root and can be listened to with `@change`, but it gives a DOM `Event`. Listen to `emit:change` to receive the value.

##### 🛠️ Exposed Methods

| Method            | Returns                               | Description |
| ----------------- | ------------------------------------- | ----------- |
| `getInstance`     | `HTMLInputElement`                    | Returns the radio element. |
| `setFocus`        | `void`                                | Focuses the radio. |
| `fireChange`      | `void`                                | Emits `update:modelValue` and `emit:change` with the value of this radio. |
| `getCurrentValue` | `string \| number \| boolean \| null` | Returns the value of this radio, converted by `modelType`. |

##### 🎨 Styling

| CSS variable                      | Description |
| --------------------------------- | ----------- |
| `--dwui-gap-input-radio`          | Space between the radio and the label. Defaults to `2px`. |
| `--dwui-width-focus-ring`         | Width of the focus ring. Defaults to `2px`. |
| `--dwui-outline-color-focus-ring` | Color of the focus ring. Defaults to `Highlight`. |
| `--dwui-offset-focus-ring`        | Offset of the focus ring. Defaults to `2px`. |
