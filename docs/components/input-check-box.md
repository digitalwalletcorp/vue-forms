#### InputCheckBox

A checkbox with a label. It is checked when the bound value equals `trueValue`, and shows validation errors from the error observer.

```vue
<template>
  <InputCheckBox
    v-model="form.notify"
    vid="notify"
    true-value="Y"
    false-value="N"
  >
    Send a notification
  </InputCheckBox>
</template>
```

[Try it in the demo](https://digitalwalletcorp.github.io/vue-forms/demo/#input-check-box)

> 💡 **Usage Notes**
> * The root element is a `<div>` wrapping a `<label>`, which contains the `<input type="checkbox">` and a `<span>` with the default slot. Clicking the label text toggles the checkbox.
> * The default slot is wrapped in a single `<span>`, so mixed content such as `foo <b>bar</b>` stays together as the label.
> * Attributes such as `class` and `style` are applied to the root `<div>`. `id`, `name`, and `disabled` are props, because they have to reach the checkbox inside. Use `inputClass` / `inputStyle` for the checkbox and `labelClass` / `labelStyle` for the label text.
> * When the error observer has an error for `vid`, the `dwui-error` class is added to the root and the messages are shown in a tooltip on the right. No default error style is provided, because browsers draw checkboxes natively. Style it in your application, for example `.dwui-input-check-box.dwui-error input`. See [Validation](../../README.md#-validation) for how to provide the error observer.

##### 🔧 Props

| Prop         | Type                                  | Description |
| ------------ | ------------------------------------- | ----------- |
| `modelValue` | `string \| number \| boolean \| null` | The bound value. The checkbox is checked when it equals `trueValue`. |
| `trueValue`  | `string \| number \| boolean`         | The value bound when checked. Defaults to `true`. |
| `falseValue` | `string \| number \| boolean`         | The value bound when unchecked. Defaults to `false`. |
| `id`         | `string`                              | The id of the checkbox. |
| `name`       | `string`                              | The name of the checkbox. |
| `disabled`   | `boolean`                             | Disables the checkbox. |
| `inputClass` | `ClassValue`                          | Class for the checkbox. |
| `inputStyle` | `StyleValue`                          | Style for the checkbox. |
| `labelClass` | `ClassValue`                          | Class for the `<span>` wrapping the label text. |
| `labelStyle` | `StyleValue`                          | Style for the `<span>` wrapping the label text. |
| `vid`        | `string`                              | The key of the validation rules. The errors of this key are shown on this checkbox. |
| `index`      | `number`                              | The index for rules defined as arrays. Errors are looked up by `` `${vid}[${index}]` `` as well as `vid`. |

##### 📣 Events

| Event               | Payload                       | Description |
| ------------------- | ----------------------------- | ----------- |
| `update:modelValue` | `string \| number \| boolean` | Emitted when the checkbox is toggled, with `trueValue` or `falseValue`. |
| `emit:change`       | `string \| number \| boolean` | Emitted right after `update:modelValue`, with the same value. |

> 💡 The native `change` event of the checkbox also reaches the root and can be listened to with `@change`, but it gives a DOM `Event`. Listen to `emit:change` to receive the value.

##### 🧩 Slots

| Slot      | Description |
| --------- | ----------- |
| `default` | The label of the checkbox. |

##### 🛠️ Exposed Methods

| Method            | Returns                       | Description |
| ----------------- | ----------------------------- | ----------- |
| `getInstance`     | `HTMLInputElement`            | Returns the checkbox element. |
| `setChecked`      | `void`                        | Sets the checked state shown on the checkbox. The bound value is not changed and no event is emitted. |
| `setFocus`        | `void`                        | Focuses the checkbox. |
| `fireChange`      | `void`                        | Emits `update:modelValue` and `emit:change` with the value of the checked state. |
| `getCurrentValue` | `string \| number \| boolean` | Returns `trueValue` or `falseValue` by the checked state. |

##### 🎨 Styling

| CSS variable                      | Description |
| --------------------------------- | ----------- |
| `--dwui-gap-input-check-box`      | Space between the checkbox and the label. Defaults to `2px`. |
| `--dwui-width-focus-ring`         | Width of the focus ring. Defaults to `2px`. |
| `--dwui-outline-color-focus-ring` | Color of the focus ring. Defaults to `Highlight`. |
| `--dwui-offset-focus-ring`        | Offset of the focus ring. Defaults to `2px`. |
