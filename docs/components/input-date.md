#### InputDate

A date and time input. It takes the digits along the template of the format, such as `____-__-__`, and opens a calendar or a time picker as a dropdown with the button beside it. It shows validation errors from the error observer.

```vue
<template>
  <InputDate
    v-model="form.birthday"
    vid="birthday"
    format-type="date"
    :calendar="true"
  />
</template>
```

[Try it in the demo](https://digitalwalletcorp.github.io/vue-forms/demo/#input-date)

> 💡 **Usage Notes**
> * The root element is a `<div>` containing the `<input>` and the button that opens the picker. The picker is shown with the dropdown of `floating-vue`, so load its stylesheet in your application.
> * Attributes such as `class` and `style` are applied to the root `<div>`. `id`, `name`, `placeholder`, `readonly`, and `disabled` are props, because they have to reach the input inside. Use `inputClass` / `inputStyle` for the input and `buttonClass` / `buttonStyle` for the button.
> * The value is bound as the digits without the separators, such as `20260930` for `2026-09-30`. While typing, the positions not typed yet are bound as `_`, such as `2026____`. An input with only the template is bound as an empty string.
> * When the value is not a valid date or time, the `dwui-error` class is added to the root and a message is shown in a tooltip. The message comes from your i18n messages by a reserved key, with an English fallback. When the error observer has an error for `vid`, it is shown in the same way. See [Validation](../../README.md#-validation) for how to provide the error observer.
> * The template is fixed in the order of year, month, and day, separated by `-` and `:` as in [Format Types](#format-types), regardless of the locale. The locale changes only the labels in the picker.
> * The names of months and days of the week, and the labels of hours, minutes, and seconds, follow the current locale of `vue-i18n`.

##### Format Types

| Format type      | Template                  | Bound value         | Picker |
| ---------------- | ------------------------- | ------------------- | ------ |
| `date`           | `____-__-__`              | `yyyyMMdd`          | Calendar |
| `time`           | `__:__:__`                | `HHmmss`            | Time |
| `datetime`       | `____-__-__ __:__:__`     | `yyyyMMddHHmmss`    | Calendar and time |
| `dateHourMinute` | `____-__-__ __:__`        | `yyyyMMddHHmm`      | Calendar and time |
| `timestamp`      | `____-__-__ __:__:__.___` | `yyyyMMddHHmmssSSS` | Calendar and time |
| `year`           | `____`                    | `yyyy`              | None |
| `yearMonth`      | `____-__`                 | `yyyyMM`            | None |
| `monthDay`       | `__-__`                   | `MMdd`              | Calendar |
| `hourMinute`     | `__:__`                   | `HHmm`              | Time |

> 💡 The picker is shown only with `calendar`. When a day is selected for a format with the time, the time is kept, and the time not typed yet is filled with zeros. In the time picker, a unit not entered yet is shown as `--`. When a unit is selected, the other units not entered yet are filled with zeros, so that the time is complete. Selecting `--` again clears only that unit.

##### Holidays and today

The holidays shown in the calendar and the time zone that decides today are given as props, because they can differ from one input to another. For the inputs that share them, an application-wide default can be provided with `inputDateOptionsKey`, in a component above the inputs or with `app.provide`. A prop wins over the provided default, and without either, no holidays are shown and today is the local date of the browser.

```ts
// Application-wide default, for example in a plugin
import { inputDateOptionsKey } from '@digitalwalletcorp/vue-forms';

app.provide(inputDateOptionsKey, {
  fetchHolidays: async (year, month) => [
    { date: '2026-01-01', name: "New Year's Day" }
  ],
  timezone: 'Asia/Tokyo'
});
```

```vue
<!-- An input with its own holidays and time zone -->
<InputDate
  v-model="form.arrival"
  format-type="date"
  :calendar="true"
  :fetch-holidays="fetchUsHolidays"
  timezone="America/New_York"
/>
```

| Option          | Type                                                    | Description |
| --------------- | ------------------------------------------------------- | ----------- |
| `fetchHolidays` | `(year: number, month: number) => Promise<InputDateHoliday[]>` | Returns the holidays of the month. A holiday is `{ date: 'yyyy-MM-dd', name, regional? }`, and a regional one is shown in another color. When it fails, no holidays are shown. |
| `timezone`      | `string`                                                | The IANA time zone that decides today, such as `Asia/Tokyo`. |

> 💡 The messages for an invalid value are taken from your i18n messages by the keys `dwui.input-date.invalid-date`, `dwui.input-date.invalid-time`, and `dwui.input-date.invalid-format`, and fall back to English. See [Messages of the library](../../README.md#-messages-of-the-library).

##### 🔧 Props

| Prop          | Type                  | Description |
| ------------- | --------------------- | ----------- |
| `modelValue`  | `string \| null`      | The bound value, as the digits without the separators. |
| `formatType`  | See [Format Types](#format-types) | The format. Required. An unsupported value throws `VueFormsError`. |
| `calendar`    | `boolean`             | Shows the button that opens the picker, for the formats with a picker. |
| `fetchHolidays` | `(year, month) => Promise<InputDateHoliday[]>` | Returns the holidays of the month shown in the calendar. Wins over the provided default. See [Holidays and today](#holidays-and-today). |
| `timezone`    | `string`              | The IANA time zone that decides today. Wins over the provided default. |
| `id`          | `string`              | The id of the input. |
| `name`        | `string`              | The name of the input. |
| `placeholder` | `string`              | The placeholder of the input. |
| `readonly`    | `boolean`             | Makes the input read-only. The picker does not open. |
| `disabled`    | `boolean`             | Disables the input and the button. |
| `inputClass`  | `ClassValue`          | Class for the input. |
| `inputStyle`  | `StyleValue`          | Style for the input. |
| `buttonClass` | `ClassValue`          | Class for the button that opens the picker. |
| `buttonStyle` | `StyleValue`          | Style for the button that opens the picker. |
| `vid`         | `string`              | The key of the validation rules. The errors of this key are shown on this input. |
| `index`       | `number`              | The index for rules defined as arrays. Errors are looked up by `` `${vid}[${index}]` `` as well as `vid`. |

##### 📣 Events

| Event               | Payload  | Description |
| ------------------- | -------- | ----------- |
| `update:modelValue` | `string` | Emitted on input, and when a day or a time is selected in the picker. |
| `emit:blur`         | `string` | Emitted when the input loses focus, with the bound value. |
| `emit:enter`        | `string` | Emitted when Enter is pressed outside of IME composition, with the bound value. |
| `emit:selectDay`    | `string` | Emitted when a day is selected in the calendar, with the bound value. |

##### 🛠️ Exposed Methods

| Method            | Returns            | Description |
| ----------------- | ------------------ | ----------- |
| `getInstance`     | `HTMLInputElement` | Returns the input element. |
| `setFocus`        | `void`             | Focuses the input. |
| `fireBlur`        | `void`             | Emits `emit:blur` with the bound value of the input. |
| `getCurrentValue` | `string`           | Returns the bound value of the input. |

##### 🎨 Styling

| CSS variable                                     | Description |
| ------------------------------------------------ | ----------- |
| `--dwui-background-form-error`                   | Background of the input while it has an error. Defaults to `#fed0e0` in light and `#5c2633` in dark. |
| `--dwui-border-color-form-error`                 | Border color of the input while it has an error. Defaults to `orangered` in light and `#ff7b5c` in dark. |
| `--dwui-color-text-form-error`                   | Text color of the input while it has an error. Defaults to `#000000` in light and `#ffe3ea` in dark. |
| `--dwui-background-dropdown`                     | Background of the dropdown panel. Defaults to `#ffffff` in light and `#2d2f34` in dark. |
| `--dwui-border-color-dropdown`                   | Border color of the dropdown panel and its arrow. Defaults to `#dddddd` in light and `#4a4d55` in dark. |
| `--dwui-color-text-dropdown`                     | Text color of the dropdown panel. Defaults to `#000000` in light and `#e6e6e6` in dark. |
| `--dwui-background-date-picker`                  | Background of the picker. Defaults to `#ffffff` in light and `#2d2f34` in dark. |
| `--dwui-color-text-date-picker`                  | Text color of the picker. Defaults to `#000000` in light and `#e6e6e6` in dark. |
| `--dwui-color-date-picker-accent`                | Color of the borders, this month, and the current month of the month list. Defaults to `rgb(70, 138, 226)` in light and `rgb(110, 168, 255)` in dark. |
| `--dwui-background-date-picker-today`            | Background of today. Defaults to `skyblue` in light and `#1e5a7a` in dark. |
| `--dwui-background-date-picker-selected`         | Background of the selected day. Defaults to `thistle` in light and `#6a4c7a` in dark. |
| `--dwui-color-text-date-picker-sunday`           | Text color of Sundays. Defaults to `red` in light and `#ff7b7b` in dark. |
| `--dwui-color-text-date-picker-saturday`         | Text color of Saturdays. Defaults to `blue` in light and `#7aa7ff` in dark. |
| `--dwui-color-text-date-picker-holiday`          | Text color of holidays. Defaults to `red` in light and `#ff7b7b` in dark. |
| `--dwui-color-text-date-picker-regional-holiday` | Text color of regional holidays. Defaults to `green` in light and `#5fd38d` in dark. |
| `--dwui-width-focus-ring`                        | Width of the focus ring. Defaults to `2px`. |
| `--dwui-outline-color-focus-ring`                | Color of the focus ring. Defaults to `Highlight`. |
| `--dwui-offset-focus-ring`                       | Offset of the focus ring. Defaults to `2px`. |

> 💡 The thin borders, shadows, and the days out of the month are made from the text color and the accent color with `color-mix()`, so they follow the variables above.
