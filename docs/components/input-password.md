#### InputPassword

A password input. It filters what the user types and shows validation errors from the error observer.

```vue
<template>
  <InputPassword
    v-model="form.password"
    vid="password"
    allow-type="ascii"
    autocomplete="new-password"
  />
</template>
```

[Try it in the demo](https://digitalwalletcorp.github.io/vue-forms/demo/#input-password)

> 💡 **Usage Notes**
> * The root element is the `<input type="password">` itself. Attributes such as `class`, `style`, `id`, `name`, `placeholder`, `maxlength`, `autocomplete`, `readonly`, and `disabled` are passed directly through to it.
> * When the error observer has an error for `vid`, the `dwui-error` class is added and the messages are shown in a tooltip on the right. See [Validation](../../README.md#-validation) for how to provide the error observer.

##### 🔧 Props

| Prop          | Type                       | Description |
| ------------- | -------------------------- | ----------- |
| `modelValue`  | `string \| null`           | The bound value. |
| `vid`         | `string`                   | The key of the validation rules. The errors of this key are shown on this input. |
| `index`       | `number`                   | The index for rules defined as arrays. Errors are looked up by `` `${vid}[${index}]` `` as well as `vid`. |
| `allowType`   | `AllowType`                | Removes characters that do not match the type while typing. See [Allow Types](./input-text.md#allow-types). |
| `allowRegexp` | `string \| RegExp \| null` | Removes characters that make the value not match the regular expression while typing. |

##### 📣 Events

| Event               | Payload  | Description |
| ------------------- | -------- | ----------- |
| `update:modelValue` | `string` | Emitted on input. |
| `emit:blur`         | `string` | Emitted when the input loses focus, with the text of the input. |
| `emit:enter`        | `string` | Emitted when Enter is pressed outside of IME composition, with the text of the input. |

##### 🛠️ Exposed Methods

| Method            | Returns            | Description |
| ----------------- | ------------------ | ----------- |
| `getInstance`     | `HTMLInputElement` | Returns the input element. |
| `setFocus`        | `void`             | Focuses the input. |
| `fireBlur`        | `void`             | Emits `emit:blur` with the text of the input. |
| `getCurrentValue` | `string`           | Returns the text of the input. |

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
