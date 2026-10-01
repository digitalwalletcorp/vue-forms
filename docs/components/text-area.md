#### TextArea

A multi-line text input. It filters what the user types, highlights the input when it reaches the maximum length, and shows validation errors from the error observer.

```vue
<template>
  <TextArea
    v-model="form.memo"
    vid="memo"
    :maxlength="1024"
    :alert-maxlength="1000"
    rows="5"
    cols="60"
  />
</template>
```

[Try it in the demo](https://digitalwalletcorp.github.io/vue-forms/demo/#text-area)

> 💡 **Usage Notes**
> * The root element is the `<textarea>` itself. Attributes such as `class`, `style`, `id`, `name`, `placeholder`, `rows`, `cols`, `autocomplete`, `readonly`, and `disabled` are passed directly through to it.
> * The value is bound as a string, including line breaks. `null` is shown as an empty text.
> * The `dwui-maximum-length` class is added while the length equals `maxlength` or exceeds `alertMaxlength`.
> * When the error observer has an error for `vid`, the `dwui-error` class is added and the messages are shown in a tooltip on the right. See [Validation](../../README.md#-validation) for how to provide the error observer.

##### 🔧 Props

| Prop             | Type                       | Description |
| ---------------- | -------------------------- | ----------- |
| `modelValue`     | `string \| null`           | The bound value. |
| `maxlength`      | `number`                   | The maximum length. Also set to the `maxlength` attribute. The textarea is highlighted when the length reaches it. |
| `alertMaxlength` | `number`                   | The textarea is highlighted when the length exceeds it. Use it to warn before the maximum length. |
| `allowType`      | `AllowType`                | Removes characters that do not match the type while typing. See [Allow Types](./input-text.md#allow-types). |
| `allowRegexp`    | `string \| RegExp \| null` | Removes characters that make the value not match the regular expression while typing. |
| `vid`            | `string`                   | The key of the validation rules. The errors of this key are shown on this textarea. |
| `index`          | `number`                   | The index for rules defined as arrays. Errors are looked up by `` `${vid}[${index}]` `` as well as `vid`. |

##### 📣 Events

| Event               | Payload  | Description |
| ------------------- | -------- | ----------- |
| `update:modelValue` | `string` | Emitted on input. |
| `emit:blur`         | `string` | Emitted when the textarea loses focus, with its text. |

##### 🛠️ Exposed Methods

| Method            | Returns               | Description |
| ----------------- | --------------------- | ----------- |
| `getInstance`     | `HTMLTextAreaElement` | Returns the textarea element. |
| `setFocus`        | `void`                | Focuses the textarea. |
| `fireBlur`        | `void`                | Emits `emit:blur` with the text of the textarea. |
| `getCurrentValue` | `string`              | Returns the text of the textarea. |

##### 🎨 Styling

| CSS variable                                 | Description |
| -------------------------------------------- | ----------- |
| `--dwui-background-form-error`               | Background while the textarea has an error. Defaults to `#fed0e0` in light and `#5c2633` in dark. |
| `--dwui-border-color-form-error`             | Border color while the textarea has an error. Defaults to `orangered` in light and `#ff7b5c` in dark. |
| `--dwui-color-text-form-error`               | Text color while the textarea has an error. Defaults to `#000000` in light and `#ffe3ea` in dark. |
| `--dwui-background-text-area-maximum-length` | Background while the textarea is at the maximum length. Defaults to `#f2f3ca` in light and `#4d4a1f` in dark. |
| `--dwui-color-text-text-area-maximum-length` | Text color while the textarea is at the maximum length. Defaults to `crimson` in light and `#ff9a9a` in dark. |
| `--dwui-width-focus-ring`                    | Width of the focus ring. Defaults to `2px`. |
| `--dwui-outline-color-focus-ring`            | Color of the focus ring. Defaults to `Highlight`. |
| `--dwui-offset-focus-ring`                   | Offset of the focus ring. Defaults to `2px`. |

> 💡 Set each background and its text color as a pair, so that the text stays readable in every theme.
> When the textarea has an error and is at the maximum length at the same time, the maximum-length style is shown.
