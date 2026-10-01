#### SwitchButton

A checkbox shown as an on/off switch. It binds a boolean, and shows validation errors from the error observer.

```vue
<template>
  <SwitchButton
    v-model="form.notify"
    vid="notify"
    label-on="ON"
    label-off="OFF"
  />

  <!-- The labels can be replaced with icons by the slots -->
  <SwitchButton
    v-model="isDark"
    bg-on="darkslategray"
    bg-off="azure"
  >
    <template #label-off><svg-high-brightness /></template>
    <template #label-on><svg-moon-phases /></template>
  </SwitchButton>
</template>
```

[Try it in the demo](https://digitalwalletcorp.github.io/vue-forms/demo/#switch-button)

> 💡 **Usage Notes**
> * The root element is a `<div>` wrapping a `<label>`, which contains a transparent `<input type="checkbox">`, the track with the labels, and the handle. Clicking anywhere on the switch toggles it.
> * Attributes such as `class` and `style` are applied to the root `<div>`. `id`, `name`, and `disabled` are props, because they have to reach the checkbox inside.
> * The look of the track and the handle is changed with the CSS variables below, and the labels with the slots. There are no class props for the parts.
> * When the error observer has an error for `vid`, the `dwui-error` class is added to the root and the messages are shown in a tooltip on the right. No default error style is provided. Style it in your application, for example `.dwui-switch-button.dwui-error .dwui-switch-button-label`. See [Validation](../../README.md#-validation) for how to provide the error observer.

##### 🔧 Props

| Prop         | Type      | Description |
| ------------ | --------- | ----------- |
| `modelValue` | `boolean` | The bound value. `true` means on. |
| `labelOn`    | `string`  | The label shown while on. The `label-on` slot takes precedence. |
| `labelOff`   | `string`  | The label shown while off. The `label-off` slot takes precedence. |
| `bgOn`       | `string`  | The background of the track while on, as a `background` value. Sets `--dwui-background-switch-button-checked`. |
| `bgOff`      | `string`  | The background of the track while off, as a `background` value. Sets `--dwui-background-switch-button`. |
| `id`         | `string`  | The id of the checkbox. |
| `name`       | `string`  | The name of the checkbox. |
| `disabled`   | `boolean` | Disables the switch. |
| `vid`        | `string`  | The key of the validation rules. The errors of this key are shown on this switch. |
| `index`      | `number`  | The index for rules defined as arrays. Errors are looked up by `` `${vid}[${index}]` `` as well as `vid`. |

##### 📣 Events

| Event               | Payload   | Description |
| ------------------- | --------- | ----------- |
| `update:modelValue` | `boolean` | Emitted when the switch is toggled. |
| `emit:change`       | `boolean` | Emitted right after `update:modelValue`, with the same value. |

> 💡 The native `change` event of the checkbox also reaches the root and can be listened to with `@change`, but it gives a DOM `Event`. Listen to `emit:change` to receive the value.

##### 🧩 Slots

| Slot        | Description |
| ----------- | ----------- |
| `label-on`  | Replaces the label shown while on. Elements such as icons can be placed. |
| `label-off` | Replaces the label shown while off. Elements such as icons can be placed. |

##### 🛠️ Exposed Methods

| Method            | Returns            | Description |
| ----------------- | ------------------ | ----------- |
| `getInstance`     | `HTMLInputElement` | Returns the checkbox element. |
| `setChecked`      | `void`             | Sets the on/off state shown on the switch. The bound value is not changed and no event is emitted. |
| `setFocus`        | `void`             | Focuses the switch. |
| `fireChange`      | `void`             | Emits `update:modelValue` and `emit:change` with the on/off state. |
| `getCurrentValue` | `boolean`          | Returns the on/off state. |

##### 🎨 Styling

| CSS variable                              | Description |
| ----------------------------------------- | ----------- |
| `--dwui-background-switch-button`         | Background of the track while off. Defaults to `#eceeef` in light and `#4a4d55` in dark. |
| `--dwui-background-switch-button-checked` | Background of the track while on. Defaults to `#47a8d8`. |
| `--dwui-color-text-switch-button`         | Color of the label while off. Defaults to `#aaaaaa` in light and `#a0a4ab` in dark. |
| `--dwui-color-text-switch-button-checked` | Color of the label while on. Defaults to `#ffffff`. |
| `--dwui-background-switch-button-handle`  | Background of the handle. Defaults to a gray gradient. |
| `--dwui-width-focus-ring`                 | Width of the focus ring. Defaults to `2px`. |
| `--dwui-outline-color-focus-ring`         | Color of the focus ring. Defaults to `Highlight`. |
| `--dwui-offset-focus-ring`                | Offset of the focus ring. Defaults to `2px`. |

> 💡 The checkbox is transparent, so the focus ring is drawn on the track.
