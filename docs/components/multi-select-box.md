#### MultiSelectBox

A multiple selection box. It shows the labels of the selected items in a read-only textarea, and opens a selection list as a dropdown when the textarea is clicked. It shows validation errors from the error observer.

```vue
<template>
  <MultiSelectBox
    v-model="form.statuses"
    vid="statuses"
    :items="statuses"
    :cols="40"
    :button-labels="{
      ok: t('button.ok'),
      selectAll: t('button.select-all'),
      clear: t('button.clear'),
      close: t('button.close')
    }"
    button-class="btn"
  />
</template>
```

[Try it in the demo](https://digitalwalletcorp.github.io/vue-forms/demo/#multi-select-box)

> 💡 **Usage Notes**
> * The root element is a `<div>` containing the textarea. The selection list is shown with the dropdown of `floating-vue`, so load its stylesheet in your application.
> * Attributes such as `class` and `style` are applied to the root `<div>`. `id`, `name`, `cols`, `rows`, and `disabled` are props, because they have to reach the textarea inside. Use `inputClass` / `inputStyle` for the textarea and `buttonClass` / `buttonStyle` for the buttons of the list.
> * The list opens on a click, or on the Enter or Space key. A click near the bottom-right corner is treated as resizing the textarea and does not open the list.
> * The selection is applied with OK. Close, or a click outside the list, closes it without changing the value.
> * The selected values are bound in the order of `items`, not in the order they were checked.
> * The `label` of each item is shown as it is, or called when it is a function, both in the textarea and in the list. See [Labels](../../README.md#%EF%B8%8F-labels).
> * Errors of `vid` are shown on the textarea in the same way as [`TextArea`](./text-area.md).

##### Groups

Items can be grouped with `optGroup` and `children`, as in [`SelectBox`](./select-box.md#items). When items without a group and groups are mixed, a group belongs to the item without a group placed right above it.

* Checking an item without a group unchecks the items of the groups that belong to it.
* Checking an item of a group unchecks the item without a group that the group belongs to.
* Select all checks every item of the groups, but not the items without a group, when both kinds are mixed. Otherwise it checks every item.

##### 🔧 Props

| Prop           | Type                                        | Description |
| -------------- | ------------------------------------------- | ----------- |
| `modelValue`   | `(string \| number \| null)[]`              | The bound array of the selected values. Required. |
| `modelType`    | `'string' \| 'number'`                      | The type of the elements of the array. Defaults to `'string'`. With `'number'`, a value of `''` or `'null'` is bound as `null`. |
| `items`        | `(ValueLabelPair \| GroupValueLabelPair)[]` | The items. See [Groups](#groups). |
| `noBlank`      | `boolean`                                   | Does not place a blank item first in the list. Defaults to `true`. |
| `lineFeed`     | `boolean`                                   | Shows one label per line in the textarea. Otherwise the labels are joined with commas. |
| `buttonLabels` | `MultiSelectBoxButtonLabels`                | The labels of the buttons of the list, as `{ ok, selectAll, clear, close }`. Each defaults to `OK`, `Select all`, `Clear`, and `Close`. |
| `id`           | `string`                                    | The id of the textarea. |
| `name`         | `string`                                    | The name of the textarea. |
| `cols`         | `number`                                    | The columns of the textarea. Defaults to `20`. |
| `rows`         | `number`                                    | The rows of the textarea. Defaults to `1`. |
| `disabled`     | `boolean`                                   | Disables the textarea. The list does not open. |
| `inputClass`   | `ClassValue`                                | Class for the textarea. |
| `inputStyle`   | `StyleValue`                                | Style for the textarea. |
| `buttonClass`  | `ClassValue`                                | Class for the buttons of the list. |
| `buttonStyle`  | `StyleValue`                                | Style for the buttons of the list. |
| `vid`          | `string`                                    | The key of the validation rules. The errors of this key are shown on the textarea. |
| `index`        | `number`                                    | The index for rules defined as arrays. Errors are looked up by `` `${vid}[${index}]` `` as well as `vid`. |

##### 📣 Events

| Event               | Payload                        | Description |
| ------------------- | ------------------------------ | ----------- |
| `update:modelValue` | `(string \| number \| null)[]` | Emitted when the selection is applied with OK. |
| `emit:change`       | `(string \| number \| null)[]` | Emitted right after `update:modelValue`, with the same value. |
| `emit:listClosed`   | —                              | Emitted when the list is closed, whether the selection was applied or not. |

##### 🛠️ Exposed Methods

| Method            | Returns                        | Description |
| ----------------- | ------------------------------ | ----------- |
| `getInstance`     | `HTMLTextAreaElement`          | Returns the textarea element. |
| `setFocus`        | `void`                         | Focuses the textarea. |
| `fireChange`      | `void`                         | Emits `update:modelValue` and `emit:change` with the current `modelValue`. |
| `getCurrentValue` | `(string \| number \| null)[]` | Returns the current `modelValue`. |

##### 🎨 Styling

The textarea is a [`TextArea`](./text-area.md), and uses its CSS variables for the error state and the focus ring. The buttons of the list have no default style except for the layout, so style them with `buttonClass` or your CSS.

| CSS variable                   | Description |
| ------------------------------ | ----------- |
| `--dwui-background-dropdown`   | Background of the dropdown panel. Defaults to `#ffffff` in light and `#2d2f34` in dark. |
| `--dwui-border-color-dropdown` | Border color of the dropdown panel and its arrow. Defaults to `#dddddd` in light and `#4a4d55` in dark. |
| `--dwui-color-text-dropdown`   | Text color of the dropdown panel. Defaults to `#000000` in light and `#e6e6e6` in dark. |
