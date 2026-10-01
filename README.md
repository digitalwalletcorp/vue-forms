# Vue Forms

Form components for Vue 3.

**[Open the interactive demo](https://digitalwalletcorp.github.io/vue-forms/demo/)** to try every component, run the validation, and switch the language and the theme.

#### ✨ Features

* **Validation built in**: Define rules, run `doValidate`, and inputs show their errors with a tooltip. Error messages are translated with `vue-i18n`.
* **Memorized inputs**: `useMemorizedValue` keeps an input value such as a search condition, and restores it the next time the page is shown.
* **Tree-shaking**: Only import what you use. Importing a single component won't bundle the rest of the library.
* **Fully typed**: Type definitions are included, allowing your editor to auto-complete props and default values automatically.
* **Easy overrides**: Default styles use zero specificity (`:where()`), so your own CSS always wins.

#### 📦 Installation

```bash
npm install @digitalwalletcorp/vue-forms @digitalwalletcorp/utils @digitalwalletcorp/vue-svg-icons vue-i18n floating-vue
# or
yarn add @digitalwalletcorp/vue-forms @digitalwalletcorp/utils @digitalwalletcorp/vue-svg-icons vue-i18n floating-vue
```

> ##### ⚠️ Requirements
>
> * **Vue 3.5.29+**: Props are typed with Vue's `ClassValue`, which is exported since Vue 3.5.29.
> * **vue-i18n 11.0.0+**: Error messages are translated with the i18n instance of your application. Create it with `legacy: false`.
> * **floating-vue 5.0.0+**: Error messages are shown with its tooltip, and the selection list of `MultiSelectBox` and the picker of `InputDate` with its dropdown. Load its stylesheet in your application as usual.
> * **@digitalwalletcorp/utils 0.2.0+**: Used to format numbers.
> * **@digitalwalletcorp/vue-svg-icons 1.15.1+**: Used for the icons in components such as `ToggleInputPassword`.
>
> These are peer dependencies, so a single shared copy is used in your application.

#### 📖 Usage

Choose the import method that fits your project requirements:

| Import Method | Bundle Size | Component Syntax | Recommended Use Case |
| --- | --- | --- | --- |
| [Import individually](#1-import-components-individually)  | 🟢 Minimal (Tree-shakable) | Explicit `import` per file | When optimizing bundle size is a priority |
| [Register all components globally (Vue)](#2-register-all-components-globally-vue) | 🟡 Full Library Included | Auto-available (no imports) | Rapid prototyping or internal admin dashboards |
| [Register components globally (Nuxt)](#3-register-components-globally-nuxt) | 🟢 Auto-optimized | Auto-imported globally | Standard Nuxt applications |

##### 1. Import components individually

```vue
<script setup lang="ts">
import { InputText } from '@digitalwalletcorp/vue-forms';
</script>

<template>
  <InputText v-model="name" vid="name" />
</template>
```

##### 2. Register all components globally (Vue)

```ts
// main.ts
import { createApp } from 'vue';
import { registerComponents } from '@digitalwalletcorp/vue-forms/register';
import App from './App.vue';

const app = createApp(App);
registerComponents(app);
app.mount('#app');
```

##### 3. Register components globally (Nuxt)

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@digitalwalletcorp/vue-forms/nuxt']
});
```

##### 📐 Stylesheet

Import the stylesheet for the default styles of the components.

* **Vue:** Import in your entry file.

```ts
// main.ts
import '@digitalwalletcorp/vue-forms/style.css';
import '@digitalwalletcorp/vue-svg-icons/style.css'; // Required for components using icons from vue-svg-icons
```

* **Nuxt:** Add to your config array.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: [
    '@digitalwalletcorp/vue-forms/style.css',
    '@digitalwalletcorp/vue-svg-icons/style.css' // Required for components using icons from vue-svg-icons
  ]
});
```

#### 🧱 Root Elements & Style Guidelines

Components are categorized into two types based on their root DOM element. Knowing the difference helps you style them correctly and apply HTML attributes/events as expected.

##### Summary

| Kind | Components | Root DOM Element | How attributes & events work | How to style inner elements |
| :--- | :--- | :--- | :--- | :--- |
| **Form Element Root** | `InputText`, `InputPassword`, `InputNumber`, `InputFile`, `TextArea`, `SelectBox` | The HTML `<input>`, `<select>`, or `<textarea>` itself | Passed directly to the form element (e.g., `id`, `placeholder`, `disabled`, `@focus`, `@paste`). | Standard CSS selectors work directly on the root element. |
| **Wrapped in `<div>`** | `InputRadio`, `InputCheckBox`, `MultiInputCheckBox`, `SwitchButton`, `ToggleInputPassword`, `MultiSelectBox`, `InputDate` | A parent `<div>` wrapping the control, labels, or extra UI elements | Root `<div>` receives unrecognized attributes/events. Control-specific options (e.g., `disabled`) are handled via **props**. | Use component props (e.g., `inputClass`, `labelClass`) to style inner elements. |

#### Key Behavioral Differences

1. **Layout & Spacing (Margins & Widths)**
   Because CSS `class` and `style` attributes **always apply to the root element** of every component, adding `margins` or `widths` works predictably across all components in the library.
2. **Attribute & Event Passthrough**
   - **Form Element Root:** Behaves like a native HTML form element. Any attribute (`aria-*`, `autocomplete`) or listener (`@blur`, `@keydown`) attaches directly to the input itself.
   - **Wrapped in `<div>`:** Standard attributes (like `id`, `name`, `disabled`) are passed via explicit **props**. Unrecognized attributes/listeners will land on the outer `<div>` wrapper instead of the inner `<input>`.
3. **Overriding Error Styles (`.dwui-error`)**
   Default styles use zero specificity (`:where()`), making custom CSS overrides effortless. However, if your global CSS styles native elements directly (e.g., `input[type='text']`), those rules might override the default `.dwui-error` styles.

   To ensure error states display correctly, explicitly target the error class alongside your component styles:

   ```css
   .dwui-input-text.dwui-error,
   .dwui-text-area.dwui-error {
     border-color: var(--border-color-form-error);
     background: var(--background-form-error);
     color: var(--color-text-form-error);
   }
   ```

#### ✅ Validation

Create an error observer with `useErrorObserver`, and run `doValidate` with your rules. Each input shows the errors whose key matches its `vid`.

```vue
<script setup lang="ts">
import { reactive } from 'vue';
import { doValidate, InputText, useErrorObserver } from '@digitalwalletcorp/vue-forms';
import type { ValidationRule } from '@digitalwalletcorp/vue-forms';

const form = reactive({ name: '' });
const errorObserver = useErrorObserver();

const onClickSave = () => {
  const rules: Record<string, ValidationRule[]> = {
    name: [{ rule: !form.name, code: 'message.required', bind: ['label.name'] }]
  };
  if (!doValidate(errorObserver, rules)) {
    return;
  }
  // save
};
</script>

<template>
  <InputText v-model="form.name" vid="name" />
  <button type="button" @click="onClickSave">Save</button>
</template>
```

```ts
// Rule Structure
type ValidationRule = {
  rule: boolean | boolean[];
  code: string;
  bind?: string[];
  condition?: 'valid';
  ruleId?: string;
  prerequisite?: string | string[];
};
```

##### Rule Configuration (`ValidationRule`)

| Property | Type | Description |
| -------- | ---- | ----------- |
| `rule` | `boolean` \| `boolean[]` | Trigger condition for the error. By default, evaluating to `true` triggers an error (reversed when `condition: 'valid'`). Pass a `boolean[]` to evaluate array/row-based items. |
| `code` | `string` | An `i18n` message key or a raw text string. When an `i18n` key is specified, it is translated along with `bind` parameters. If a raw text string is passed, it is displayed directly as the error message. |
| `bind` | `string[]` | (Optional) Translation keys passed as parameters to the `code` message. In array-based rules, `'$index'` is dynamically replaced with the 1-based row index. Note: Ignored if `code` does not recognize as `i18n` key. |
| `condition` | `'valid'` \| `'invalid'` | (Optional) Inverts rule evaluation logic. When set to `'valid'`, evaluating to `false` triggers an error. |
| `ruleId` | `string` | (Optional) The ID of the rule, referred to by `prerequisite` of other rules. |
| `prerequisite` | `string` \| `string[]` | (Optional) The rules that this rule depends on. If one of them already has an error, this rule evaluation is skipped. Specify `ruleId` for a rule of the same key, or `key.ruleId` for a rule of another key. In row-based checks, the rule of the same row is referred to. With `key.ruleId`, the rule of a key without rows (e.g., a header item) is also referred to. |

##### Key Behaviors & Scope
- **Array Rules (`rule: boolean[]`):** Each element is checked independently per row. Errors are stored under the indexed key format `${key}[${index}]` matching the input's `index` prop.

- **Observer Scope (`useErrorObserver`):** Provides the error observer context to all child components beneath the caller. Invoke this in form-holding parent containers (pages, layouts, or modal dialogs). Modals with their own observer instance keep error states isolated from the parent page.

| Function           | Description |
| ------------------ | ----------- |
| `useErrorObserver` | Creates an error observer, provides it to the components below, and returns it. Call it in `setup`. |
| `useInputError`    | Returns `hasError` and `message` of a `vid` (and `index`) as computed refs, from the provided observer. Call it in `setup` of your own input component. |
| `doValidate`       | Checks the rules, stores the errors in the error observer, and returns `true` when there is none. When item keys are given, only those rules are checked and only their previous errors are cleared. With `index`, the errors of the rules whose `rule` is a single boolean are stored under `` `${key}[${index}]` ``, to check one row. |
| `clearErrors`      | Clears the errors of the given keys (strings or regular expressions), or all errors. |
| `extractErrors`    | Returns the errors of the given keys. |
| `containsError`    | Returns whether there is an error for the given keys, including indexed keys. |
| `hasInputError`    | Returns whether there is an error for a `vid` (and `index`), from an observer given as the argument. |
| `tooltip`          | Returns the translated messages for a `vid` (and `index`), from an observer given as the argument. Call it while a component is rendering. |

`doValidate` throws `VueFormsError` when the error observer is missing or an item key is not in the rules.

##### 🏷️ Labels

The labels of options, such as `items` of `SelectBox` and `item` of `InputRadio`, are `LabelText`: a string, or a function that returns a string. The components do not translate them.

To ensure labels update dynamically when changing the `vue-i18n` locale, pass an arrow function so it is evaluated on each render:

```ts
const currencies: ValueLabelPair<string>[] = [
  {
    value: 'JPY',
    label: () => t('item.currency.jpy') // Re-evaluated dynamically on locale change
  },
  {
    value: 'USD',
    label: 'US Dollar'
  }
];
```

> 💡 **Note:** Passing a plain string directly to `label` will prevent the text from updating when the application locale changes at runtime.

##### 🌐 Messages of the library

`InputDate` shows a message when the value is not a valid date or time. The messages are looked up in your i18n messages by the keys below, and fall back to English when a key is missing in the current locale.

| Key                               | Fallback |
| --------------------------------- | -------- |
| `dwui.input-date.invalid-date`    | `Invalid date` |
| `dwui.input-date.invalid-time`    | `Invalid time` |
| `dwui.input-date.invalid-format`  | `Invalid format` |

##### ⚙️ Adapting to your application

**🎨 Dark Mode & Theme Support**

Components automatically adapt to your application's color-scheme (supporting both light and dark modes natively).

- **Follow OS Setting:** Add `:root { color-scheme: light dark; }` to your global CSS.
- **Custom Theme Switching:** Change the CSS `color-scheme` property on `:root` or a parent container (e.g., `color-scheme: dark`). The components and native form controls will switch automatically.

**🛠️ Customizing Styles (`--dwui-*` Variables)**

Default styles use CSS variables (`--dwui-*`) and zero-specificity selectors (`:where()`), making them easy to override.

We recommend creating a `vue-forms-variables.css` file to map your application's design tokens to the library's `--dwui-*` variables, and importing it after the library stylesheet.

```css
/* vue-forms-variables.css */
:root {
  --dwui-background-form-error: var(--background-form-error);
  --dwui-border-color-form-error: var(--border-color-form-error);
  --dwui-color-text-form-error: var(--color-text-form-error);
  --dwui-width-focus-ring: var(--width-focus-ring);
  --dwui-outline-color-focus-ring: var(--outline-color-focus-ring);
  --dwui-offset-focus-ring: var(--offset-focus-ring);
}
```

> 💡 **Component-Specific Notes:**
> * Dropdown Colors: To customize dropdown panel colors (`InputDate` and `MultiSelectBox`), override their `--dwui-*` CSS variables rather than targeting internal dropdown classes directly.
> * Error State Styles (`.dwui-error`): If your global CSS targets native elements directly (e.g., `input[type='text']`), those rules may override the library's zero-specificity error styles. In that case, explicitly re-apply error styles with `.dwui-error`

```css
.dwui-input-text.dwui-error,
.dwui-text-area.dwui-error {
  border-color: var(--border-color-form-error);
  background: var(--background-form-error);
  color: var(--color-text-form-error);
}
```

#### 💾 Memorizing Values

`useMemorizedValue` automatically persists input state to `localStorage` and restores it when the page reloads or mounts.

```vue
<script setup lang="ts">
import { onMounted, reactive, toRef } from 'vue';
import { MultiInputCheckBox, useMemorizedValue } from '@digitalwalletcorp/vue-forms';

const searchCondition = reactive({ statuses: [] as string[] });
// Call it before other onMounted hooks that use the value, such as the first search
useMemorizedValue('status', toRef(searchCondition, 'statuses'));

onMounted(() => {
  search(searchCondition);
});
</script>

<template>
  <MultiInputCheckBox
    v-for="status in ['open', 'closed']"
    :key="status"
    v-model="searchCondition.statuses"
    :value="status"
  >
    {{ status }}
  </MultiInputCheckBox>
</template>
```

- **Use Cases:** Persisting search filter criteria, table page size preferences, or user view settings across sessions.
- **Execution Lifecycle:** Restores saved values on `onMounted` and automatically saves updates whenever the source ref changes.
- **Storage Key Resolution:** State identity is scoped by `[Route Path] + [Component Hierarchy] + [Key]`.

> ⚠️ **Important Caveats**
> * **JSON Serializability:** Only JSON-compatible values (`string`, `number`, `boolean`, `null`, `Array`, `Object`) can be persisted. Non-serializable objects (e.g., `Date`, `Function`) are not supported.
> * **Refactoring Impact:** Renaming the host component or altering its parent layout tree will change its identifier, causing previously stored values to become unlinked.

#### 🧰 Components

| Component | Description |
| --------- | ----------- |
| [`InputCheckBox`](https://github.com/digitalwalletcorp/vue-forms/blob/main/docs/components/input-check-box.md) | A checkbox with a label, bound to a pair of values. |
| [`InputDate`](https://github.com/digitalwalletcorp/vue-forms/blob/main/docs/components/input-date.md) | A date and time input along a template, with a calendar and a time picker. |
| [`InputFile`](https://github.com/digitalwalletcorp/vue-forms/blob/main/docs/components/input-file.md) | A file picker that binds the selected files. |
| [`InputNumber`](https://github.com/digitalwalletcorp/vue-forms/blob/main/docs/components/input-number.md) | A number input that binds a number, with range correction and a limit of decimal digits. |
| [`InputPassword`](https://github.com/digitalwalletcorp/vue-forms/blob/main/docs/components/input-password.md) | A password input with input filtering. |
| [`InputRadio`](https://github.com/digitalwalletcorp/vue-forms/blob/main/docs/components/input-radio.md) | A radio button with a translated label. |
| [`InputText`](https://github.com/digitalwalletcorp/vue-forms/blob/main/docs/components/input-text.md) | A single-line text input with input filtering and number conversion. |
| [`MultiInputCheckBox`](https://github.com/digitalwalletcorp/vue-forms/blob/main/docs/components/multi-input-check-box.md) | A checkbox with a label that binds a group of checkboxes to one array. |
| [`MultiSelectBox`](https://github.com/digitalwalletcorp/vue-forms/blob/main/docs/components/multi-select-box.md) | A multiple selection box that opens a selection list with checkboxes as a dropdown. |
| [`SelectBox`](https://github.com/digitalwalletcorp/vue-forms/blob/main/docs/components/select-box.md) | A drop-down list with translated labels and option groups. |
| [`SwitchButton`](https://github.com/digitalwalletcorp/vue-forms/blob/main/docs/components/switch-button.md) | A checkbox shown as an on/off switch, bound to a boolean. |
| [`TextArea`](https://github.com/digitalwalletcorp/vue-forms/blob/main/docs/components/text-area.md) | A multi-line text input with input filtering and a maximum-length highlight. |
| [`ToggleInputPassword`](https://github.com/digitalwalletcorp/vue-forms/blob/main/docs/components/toggle-input-password.md) | A password input whose text can be shown and hidden, with a button that creates a password. |

#### 📜 License

This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/licenses/MIT) file for details.
