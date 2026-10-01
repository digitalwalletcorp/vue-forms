#### ToggleInputPassword

A password input whose text can be shown and hidden, with a button that creates a password. It shows validation errors from the error observer.

```vue
<template>
  <ToggleInputPassword
    v-model="form.password"
    vid="password"
    :maxlength="20"
    button-class="btn btn-sm"
    @emit:password-created="onCreatePassword"
  />
</template>
```

[Try it in the demo](https://digitalwalletcorp.github.io/vue-forms/demo/#toggle-input-password)

> 💡 **Usage Notes**
> * The root element is a `<div>` containing the input, the toggle button, and the create button. The input is an [`InputPassword`](./input-password.md) while hidden and an [`InputText`](./input-text.md) while shown.
> * Attributes such as `class` and `style` are applied to the root `<div>`. `id`, `name`, `placeholder`, `maxlength`, `readonly`, and `disabled` are props, because they have to reach the input inside. Use `inputClass` / `inputStyle` for the input and `buttonClass` / `buttonStyle` for the create button.
> * `autocomplete` is set by the component: `new-password` while hidden and `off` while shown.
> * The create button is disabled while `readonly` or `disabled`.
> * Errors of `vid` are shown on the input in the same way as [`InputPassword`](./input-password.md).

##### 🔧 Props

| Prop                  | Type                       | Description |
| --------------------- | -------------------------- | ----------- |
| `modelValue`          | `string \| null`           | The bound value. |
| `allowType`           | `AllowType`                | Removes characters that do not match the type while typing. See [Allow Types](./input-text.md#allow-types). |
| `allowRegexp`         | `string \| RegExp \| null` | Removes characters that make the value not match the regular expression while typing. |
| `visibleCreateButton` | `boolean`                  | Shows the create button. Defaults to `true`. |
| `createPassword`      | `() => string`             | Creates a password when the create button is clicked. Defaults to a 12-character password including at least one digit, one lower-case letter, one upper-case letter, and one symbol. Give your own function to follow the password rules of your system. |
| `id`                  | `string`                   | The id of the input. |
| `name`                | `string`                   | The name of the input. |
| `placeholder`         | `string`                   | The placeholder of the input. |
| `maxlength`           | `number`                   | The maximum length of the input. |
| `readonly`            | `boolean`                  | Makes the input read-only. |
| `disabled`            | `boolean`                  | Disables the input. |
| `inputClass`          | `ClassValue`               | Class for the input. |
| `inputStyle`          | `StyleValue`               | Style for the input. |
| `buttonClass`         | `ClassValue`               | Class for the create button. |
| `buttonStyle`         | `StyleValue`               | Style for the create button. |
| `vid`                 | `string`                   | The key of the validation rules. The errors of this key are shown on the input. |
| `index`               | `number`                   | The index for rules defined as arrays. Errors are looked up by `` `${vid}[${index}]` `` as well as `vid`. |

##### 📣 Events

| Event                  | Payload  | Description |
| ---------------------- | -------- | ----------- |
| `update:modelValue`    | `string` | Emitted on input, and when a password is created. |
| `emit:blur`            | `string` | Emitted when the input loses focus, with the text of the input. |
| `emit:enter`           | `string` | Emitted when Enter is pressed outside of IME composition, with the text of the input. |
| `emit:passwordCreated` | `string` | Emitted when a password is created, with the password. |

##### 🧩 Slots

| Slot     | Description |
| -------- | ----------- |
| `create` | Replaces the label of the create button. Defaults to `CREATE`. |

##### 🛠️ Exposed Methods

| Method            | Returns            | Description |
| ----------------- | ------------------ | ----------- |
| `getInstance`     | `HTMLInputElement` | Returns the input element shown now. |
| `setFocus`        | `void`             | Focuses the input shown now. |
| `fireBlur`        | `void`             | Runs the blur handling of the input shown now. |
| `getCurrentValue` | `string`           | Returns the text of the input shown now. |

##### 🎨 Styling

| CSS variable                       | Description |
| ---------------------------------- | ----------- |
| `--dwui-gap-toggle-input-password` | Space between the input and the buttons. Defaults to `2px`. |
| `--dwui-width-focus-ring`          | Width of the focus ring of the buttons. Defaults to `2px`. |
| `--dwui-outline-color-focus-ring`  | Color of the focus ring of the buttons. Defaults to `Highlight`. |
| `--dwui-offset-focus-ring`         | Offset of the focus ring of the buttons. Defaults to `2px`. |

> 💡 The toggle button shows only the eye icon, with no border and background. The create button has no default style, so style it with `buttonClass` or your CSS.
