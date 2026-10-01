#### InputNumber

A number input. The value is always bound as a number, settled when the input loses focus, and shows validation errors from the error observer.

```vue
<template>
  <InputNumber
    v-model="form.rate"
    vid="rate"
    :min="0"
    :max="100"
    :scale="2"
    step="0.01"
  />
</template>
```

[Try it in the demo](https://digitalwalletcorp.github.io/vue-forms/demo/#input-number)

> 💡 **Usage Notes**
> * The root element is the `<input type="number">` itself. Attributes such as `class`, `style`, `id`, `name`, `placeholder`, `step`, `autocomplete`, `readonly`, and `disabled` are passed directly through to it.
> * The value is bound as a number, and an empty input as `null`. `update:modelValue` is emitted only on blur, together with `emit:blur`, because converting each keystroke to a number would break partial input. Changes cannot be detected character by character.
> * To bind the value as a string, use [`InputText`](./input-text.md) with `allow-type="number"` or `allow-type="decimal"`.
> * `e` and `E` cannot be typed, because exponent notation is not supported.
> * When the error observer has an error for `vid`, the `dwui-error` class is added and the messages are shown in a tooltip on the right. See [Validation](../../README.md#-validation) for how to provide the error observer.

##### 🔧 Props

| Prop         | Type             | Description |
| ------------ | ---------------- | ----------- |
| `modelValue` | `number \| null` | The bound value. |
| `min`        | `number`         | The minimum value. A smaller value is corrected to this value on blur. Also set to the `min` attribute. |
| `max`        | `number`         | The maximum value. A larger value is corrected to this value on blur. Also set to the `max` attribute. |
| `scale`      | `number`         | The maximum number of digits after the decimal point. Extra digits are cut off while typing. With `0`, the decimal point cannot be typed. A negative value throws `VueFormsError`. |
| `vid`        | `string`         | The key of the validation rules. The errors of this key are shown on this input. |
| `index`      | `number`         | The index for rules defined as arrays. Errors are looked up by `` `${vid}[${index}]` `` as well as `vid`. |

##### 📣 Events

| Event               | Payload          | Description |
| ------------------- | ---------------- | ----------- |
| `update:modelValue` | `number \| null` | Emitted on blur, with the value corrected by `min` and `max`. |
| `emit:blur`         | `number \| null` | Emitted on blur, with the same value as `update:modelValue`. |
| `emit:enter`        | `number \| null` | Emitted when Enter is pressed outside of IME composition, with the number of the input. |

##### 🛠️ Exposed Methods

| Method            | Returns            | Description |
| ----------------- | ------------------ | ----------- |
| `getInstance`     | `HTMLInputElement` | Returns the input element. |
| `setFocus`        | `void`             | Focuses the input. |
| `fireBlur`        | `void`             | Runs the blur handling as if the input lost focus. |
| `getCurrentValue` | `number \| null`   | Returns the number of the input, or `null` when it is empty. |

##### 🎨 Styling

| CSS variable                      | Description |
| --------------------------------- | ----------- |
| `--dwui-background-form-error`    | Background while the input has an error. Defaults to `#fed0e0` in light and `#5c2633` in dark. |
| `--dwui-border-color-form-error`  | Border color while the input has an error. Defaults to `orangered` in light and `#ff7b5c` in dark. |
| `--dwui-color-text-form-error`    | Text color while the input has an error. Defaults to `#000000` in light and `#ffe3ea` in dark. |
| `--dwui-width-focus-ring`         | Width of the focus ring. Defaults to `2px`. |
| `--dwui-outline-color-focus-ring` | Color of the focus ring. Defaults to `Highlight`. |
| `--dwui-offset-focus-ring`        | Offset of the focus ring. Defaults to `2px`. |

> 💡 Set the background and the text color as a pair, so that the text stays readable on the error background in every theme.
