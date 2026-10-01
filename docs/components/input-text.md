#### InputText

A single-line text input. It filters what the user types, converts the value to a number when asked, and shows validation errors from the error observer.

```vue
<template>
  <InputText
    v-model="form.amount"
    vid="amount"
    model-type="comma-digit"
    maxlength="12"
    class="wide"
  />
</template>
```

[Try it in the demo](https://digitalwalletcorp.github.io/vue-forms/demo/#input-text)

> 💡 **Usage Notes**
> * The root element is the `<input>` itself. Attributes such as `class`, `style`, `id`, `name`, `placeholder`, `maxlength`, `autocomplete`, `readonly`, and `disabled` are passed directly through to it.
> * When the error observer has an error for `vid`, the `dwui-error` class is added and the messages are shown in a tooltip on the right. See [Validation](../../README.md#-validation) for how to provide the error observer.

##### 🔧 Props

| Prop          | Type                                   | Description |
| ------------- | -------------------------------------- | ----------- |
| `modelValue`  | `string \| number \| null`             | The bound value. |
| `modelType`   | `'string' \| 'number' \| 'comma-digit'` | The type of the bound value. Defaults to `'string'`. See [Model Types](#model-types). |
| `vid`         | `string`                               | The key of the validation rules. The errors of this key are shown on this input. |
| `index`       | `number`                               | The index for rules defined as arrays. Errors are looked up by `` `${vid}[${index}]` `` as well as `vid`. |
| `allowType`   | `AllowType`                            | Removes characters that do not match the type while typing. See [Allow Types](#allow-types). |
| `allowRegexp` | `string \| RegExp \| null`             | Removes characters that make the value not match the regular expression while typing. |

##### 📣 Events

| Event               | Payload                    | Description |
| ------------------- | -------------------------- | ----------- |
| `update:modelValue` | `string \| number \| null` | Emitted on input and on blur. |
| `emit:blur`         | `string \| number \| null` | Emitted when the input loses focus, with the settled value. |
| `emit:enter`        | `string`                   | Emitted when Enter is pressed outside of IME composition, with the text of the input. |

##### 🛠️ Exposed Methods

| Method            | Returns                    | Description |
| ----------------- | -------------------------- | ----------- |
| `getInstance`     | `HTMLInputElement`         | Returns the input element. |
| `setFocus`        | `void`                     | Focuses the input. |
| `fireBlur`        | `void`                     | Runs the blur handling as if the input lost focus. |
| `getCurrentValue` | `string \| number \| null` | Returns the current value of the input, converted by `modelType`. |

##### Model Types

| Model type    | Behavior |
| ------------- | -------- |
| `string`      | The text is bound as it is. |
| `number`      | The text is bound as a number, and an empty input as `null`. Characters that make the text not a number are removed. A leading `+` or `-` can be typed; it is bound once a number follows. |
| `comma-digit` | Same as `number`, and the value is shown with thousands separators while the input is not focused. |

##### Allow Types

| Allow type | Allowed characters |
| ---------- | ------------------ |
| `ascii`    | Printable ASCII characters |
| `number`   | Digits, with an optional leading sign |
| `decimal`  | Digits and one decimal point, with an optional leading sign |
| `alpha`    | Latin letters |
| `alphanum` | Latin letters and digits |

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
