#### MultiInputCheckBox

A checkbox with a label that binds a group of checkboxes to one array. Checking it adds its `value` to the array, and unchecking removes it. It shows validation errors from the error observer.

```vue
<template>
  <MultiInputCheckBox
    v-for="item in statuses"
    :key="item.value"
    v-model="form.statuses"
    vid="statuses"
    :value="item.value"
  >
    {{ item.label }}
  </MultiInputCheckBox>
</template>
```

[Try it in the demo](https://digitalwalletcorp.github.io/vue-forms/demo/#multi-input-check-box)

> 💡 **Usage Notes**
> * Use [`InputCheckBox`](./input-check-box.md) for a single checkbox bound to a pair of values.
> * The root element is a `<div>` wrapping a `<label>`, which contains the `<input type="checkbox">` and a `<span>` with the default slot. Clicking the label text toggles the checkbox.
> * The default slot is wrapped in a single `<span>`, so mixed content such as `foo <b>bar</b>` stays together as the label.
> * Attributes such as `class` and `style` are applied to the root `<div>`. `id`, `name`, and `disabled` are props, because they have to reach the checkbox inside. Use `inputClass` / `inputStyle` for the checkbox and `labelClass` / `labelStyle` for the label text.
> * When the error observer has an error for `vid`, the `dwui-error` class is added to the root and the messages are shown in a tooltip on the right. No default error style is provided, because browsers draw checkboxes natively. Style it in your application, for example `.dwui-multi-input-check-box.dwui-error input`. See [Validation](../../README.md#-validation) for how to provide the error observer.

##### 🔧 Props

| Prop         | Type                           | Description |
| ------------ | ------------------------------ | ----------- |
| `modelValue` | `(string \| number \| null)[]` | The bound array. Required. The checkbox is checked when it contains `value`. |
| `value`      | `string \| number \| null`     | The value of this checkbox, added to the array when checked. |
| `modelType`  | `'string' \| 'number'`         | The type of the elements of the array. Defaults to `'string'`. With `'number'`, the elements are bound as numbers. |
| `id`         | `string`                       | The id of the checkbox. |
| `name`       | `string`                       | The name of the checkbox. |
| `disabled`   | `boolean`                      | Disables the checkbox. |
| `inputClass` | `ClassValue`                   | Class for the checkbox. |
| `inputStyle` | `StyleValue`                   | Style for the checkbox. |
| `labelClass` | `ClassValue`                   | Class for the `<span>` wrapping the label text. |
| `labelStyle` | `StyleValue`                   | Style for the `<span>` wrapping the label text. |
| `vid`        | `string`                       | The key of the validation rules. The errors of this key are shown on this checkbox. |
| `index`      | `number`                       | The index for rules defined as arrays. Errors are looked up by `` `${vid}[${index}]` `` as well as `vid`. |

##### 📣 Events

| Event               | Payload                        | Description |
| ------------------- | ------------------------------ | ----------- |
| `update:modelValue` | `(string \| number \| null)[]` | Emitted when the checkbox is toggled, with the new array. |
| `emit:change`       | `(string \| number \| null)[]` | Emitted right after `update:modelValue`, with the same value. |

> 💡 The native `change` event of the checkbox also reaches the root and can be listened to with `@change`, but it gives a DOM `Event`. Listen to `emit:change` to receive the value.

##### 🧩 Slots

| Slot      | Description |
| --------- | ----------- |
| `default` | The label of the checkbox. |

##### 🛠️ Exposed Methods

| Method        | Returns            | Description |
| ------------- | ------------------ | ----------- |
| `getInstance` | `HTMLInputElement` | Returns the checkbox element. |
| `setFocus`    | `void`             | Focuses the checkbox. |
| `fireChange`  | `void`             | Emits `update:modelValue` and `emit:change` with the current `modelValue`. |

##### 🎨 Styling

| CSS variable                       | Description |
| ---------------------------------- | ----------- |
| `--dwui-gap-multi-input-check-box` | Space between the checkbox and the label. Defaults to `2px`. |
| `--dwui-width-focus-ring`          | Width of the focus ring. Defaults to `2px`. |
| `--dwui-outline-color-focus-ring`  | Color of the focus ring. Defaults to `Highlight`. |
| `--dwui-offset-focus-ring`         | Offset of the focus ring. Defaults to `2px`. |

> 💡 Each checkbox has a right margin of `4px` by default, so that checkboxes placed side by side are spaced apart. Override it with your CSS, for example `.dwui-multi-input-check-box { margin-right: 8px; }`.
