#### InputFile

A file picker. It binds the selected files, and shows validation errors from the error observer.

```vue
<template>
  <InputFile
    v-model="form.documents"
    vid="documents"
    :accept="[
      '.xls',
      '.xlsx'
    ]"
    multiple
  />
</template>
```

[Try it in the demo](https://digitalwalletcorp.github.io/vue-forms/demo/#input-file)

> 💡 **Usage Notes**
> * The root element is the `<input type="file">` itself. Attributes such as `class`, `style`, `id`, `name`, `multiple`, `webkitdirectory`, and `disabled` are passed directly through to it.
> * The selected files are bound as a `FileList`, and `null` when no file is selected.
> * To clear the selection, set the bound value to `null`. The input is cleared as well.
> * When the error observer has an error for `vid`, the `dwui-error` class is added and the messages are shown in a tooltip on the right. See [Validation](../../README.md#-validation) for how to provide the error observer.

##### 🔧 Props

| Prop         | Type                   | Description |
| ------------ | ---------------------- | ----------- |
| `modelValue` | `FileList \| null`     | The bound value. Setting it to `null` clears the input. |
| `accept`     | `string \| string[]`   | The file types that can be selected, such as `'image/*'` or `'.csv'`. An array is joined with commas into the `accept` attribute, so each type can be written on its own line. |
| `vid`        | `string`               | The key of the validation rules. The errors of this key are shown on this input. |
| `index`      | `number`               | The index for rules defined as arrays. Errors are looked up by `` `${vid}[${index}]` `` as well as `vid`. |

##### 📣 Events

| Event               | Payload            | Description |
| ------------------- | ------------------ | ----------- |
| `update:modelValue` | `FileList \| null` | Emitted when the selection changes. |
| `emit:change`       | `FileList \| null` | Emitted right after `update:modelValue`, with the same value. |

> 💡 The native `change` event of the file input also reaches the root and can be listened to with `@change`, but it gives a DOM `Event`. Listen to `emit:change` to receive the value.

##### 🛠️ Exposed Methods

| Method            | Returns            | Description |
| ----------------- | ------------------ | ----------- |
| `getInstance`     | `HTMLInputElement` | Returns the input element. |
| `setFocus`        | `void`             | Focuses the input. |
| `fireChange`      | `void`             | Emits `update:modelValue` and `emit:change` with the selected files. |
| `clearInput`      | `void`             | Clears the input. The bound value is not changed and no event is emitted. |
| `getCurrentValue` | `FileList \| null` | Returns the selected files, or `null` when no file is selected. |

##### 🎨 Styling

| CSS variable                      | Description |
| --------------------------------- | ----------- |
| `--dwui-background-form-error`    | Background while the input has an error. Defaults to `#fed0e0` in light and `#5c2633` in dark. |
| `--dwui-border-color-form-error`  | Border color while the input has an error. Defaults to `orangered` in light and `#ff7b5c` in dark. |
| `--dwui-color-text-form-error`    | Text color while the input has an error. Defaults to `#000000` in light and `#ffe3ea` in dark. |
| `--dwui-width-focus-ring`         | Width of the focus ring. Defaults to `2px`. |
| `--dwui-outline-color-focus-ring` | Color of the focus ring. Defaults to `Highlight`. |
| `--dwui-offset-focus-ring`        | Offset of the focus ring. Defaults to `2px`. |

> 💡 Set the background and the text color as a pair, so that the text stays readable in every theme.
> The file selector button is drawn by the browser. Style it in your application with `.dwui-input-file::file-selector-button`.
