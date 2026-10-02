module.exports = {
  'extends': [
    'stylelint-config-recommended-vue'
  ],
  'ignoreFiles': [
    'node_modules/**/*',
    'test/**/*'
  ],
  'overrides': [
    {
      'files': [
        'src/**/*.{js,ts}'
      ]
    }
  ],
  'rules': {
    // Color
    // color-no-invalid-hex: Disallow invalid hex colors.
    // Font family
    // font-family-no-duplicate-names: Disallow duplicate font family names.
    // font-family-no-missing-generic-family-keyword: Disallow missing generic families in lists of font family names.
    'font-family-no-missing-generic-family-keyword': null,
    // Function
    // function-calc-no-invalid: Disallow an invalid expression within calc functions.
    // function-calc-no-unspaced-operator: Disallow an unspaced operator within calc functions.
    // function-linear-gradient-no-nonstandard-direction: Disallow direction values in linear-gradient() calls that are not valid according to the standard syntax.
    // String
    // string-no-newline: Disallow (unescaped) newlines in strings.
    // Unit
    // unit-no-unknown: Disallow unknown units.
    // Property
    // property-no-unknown: Disallow unknown properties.
    'property-no-unknown': [true, {
      ignoreProperties: ['text-wrap-mode']
    }],
    // Keyframe declaration
    // keyframe-declaration-no-important: Disallow !important within keyframe declarations.
    // Declaration block
    // declaration-block-no-duplicate-properties: Disallow duplicate properties within declaration blocks.
    // declaration-block-no-shorthand-property-overrides: Disallow shorthand properties that override related longhand properties.
    // Block
    // block-no-empty: Disallow empty blocks.
    // Selector
    // selector-pseudo-class-no-unknown: Disallow unknown pseudo-class selectors.
    // selector-pseudo-element-no-unknown: Disallow unknown pseudo-element selectors.
    // selector-type-no-unknown: Disallow unknown type selectors.
    // Media feature
    // media-feature-name-no-unknown: Disallow unknown media feature names.
    // At-rule
    // at-rule-no-unknown: Disallow unknown at-rules.
    // Comment
    // comment-no-empty: Disallow empty comments.
    // General / Sheet
    // no-descending-specificity: Disallow selectors of lower specificity from coming after overriding selectors of higher specificity.
    'no-descending-specificity': null,
    // no-duplicate-at-import-rules: Disallow duplicate @import rules within a stylesheet.
    // no-duplicate-selectors: Disallow duplicate selectors within a stylesheet.
    // no-empty-source: Disallow empty sources.
    'no-empty-source': null,
    // no-extra-semicolons: Disallow extra semicolons (Autofixable).
    // no-invalid-double-slash-comments: Disallow double-slash comments (//...) which are not supported by CSS.
    // Limit language features
    // Color
    // color-named: Require (where possible) or disallow named colors.
    // color-no-hex: Disallow hex colors.
    // Function
    // function-blacklist: Specify a blacklist of disallowed functions.
    // function-url-no-scheme-relative: Disallow scheme-relative urls.
    // function-url-scheme-blacklist: Specify a blacklist of disallowed URL schemes.
    // function-url-scheme-whitelist: Specify a whitelist of allowed URL schemes.
    // function-whitelist: Specify a whitelist of allowed functions.
    // Keyframes
    // keyframes-name-pattern: Specify a pattern for keyframe names.
    // Number
    // number-max-precision: Limit the number of decimal places allowed in numbers.
    // Time
    // time-min-milliseconds: Specify the minimum number of milliseconds for time values.
    // Unit
    // unit-blacklist: Specify a blacklist of disallowed units.
    // unit-whitelist: Specify a whitelist of allowed units.
    // Shorthand property
    // shorthand-property-no-redundant-values: Disallow redundant values in shorthand properties (Autofixable).
    // Value
    // value-no-vendor-prefix: Disallow vendor prefixes for values.
    // Custom property
    // custom-property-pattern: Specify a pattern for custom properties.
    // Property
    // property-blacklist: Specify a blacklist of disallowed properties.
    // property-no-vendor-prefix: Disallow vendor prefixes for properties.
    // property-whitelist: Specify a whitelist of allowed properties.
    // Declaration
    // declaration-block-no-redundant-longhand-properties: Disallow longhand properties that can be combined into one shorthand property.
    // declaration-no-important: Disallow !important within declarations.
    // declaration-property-unit-blacklist: Specify a blacklist of disallowed property and unit pairs within declarations.
    // declaration-property-unit-whitelist: Specify a whitelist of allowed property and unit pairs within declarations.
    // declaration-property-value-blacklist: Specify a blacklist of disallowed property and value pairs within declarations.
    // declaration-property-value-whitelist: Specify a whitelist of allowed property and value pairs within declarations.
    // Declaration block
    // declaration-block-single-line-max-declarations: Limit the number of declarations within a single-line declaration block.
    // Selector
    // selector-attribute-operator-blacklist: Specify a blacklist of disallowed attribute operators.
    // selector-attribute-operator-whitelist: Specify a whitelist of allowed attribute operators.
    // selector-class-pattern: Specify a pattern for class selectors.
    // selector-combinator-blacklist: Specify a blacklist of disallowed combinators.
    // selector-combinator-whitelist: Specify a whitelist of allowed combinators.
    // selector-id-pattern: Specify a pattern for ID selectors.
    // selector-max-attribute: Limit the number of attribute selectors in a selector.
    // selector-max-class: Limit the number of classes in a selector.
    // selector-max-combinators: Limit the number of combinators in a selector.
    // selector-max-compound-selectors: Limit the number of compound selectors in a selector.
    // selector-max-empty-lines: Limit the number of adjacent empty lines within selectors (Autofixable).
    // selector-max-id: Limit the number of ID selectors in a selector.
    // selector-max-pseudo-class: Limit the number of pseudo-classes in a selector.
    // selector-max-specificity: Limit the specificity of selectors.
    // selector-max-type: Limit the number of type in a selector.
    // selector-max-universal: Limit the number of universal selectors in a selector.
    // selector-nested-pattern: Specify a pattern for the selectors of rules nested within rules.
    // selector-no-qualifying-type: Disallow qualifying a selector by type.
    // selector-no-vendor-prefix: Disallow vendor prefixes for selectors.
    // selector-pseudo-class-blacklist: Specify a blacklist of disallowed pseudo-class selectors.
    // selector-pseudo-class-whitelist: Specify a whitelist of allowed pseudo-class selectors.
    // selector-pseudo-element-blacklist: Specify a blacklist of disallowed pseudo-element selectors.
    // selector-pseudo-element-whitelist: Specify a whitelist of allowed pseudo-element selectors.
    // Media feature
    // media-feature-name-blacklist: Specify a blacklist of disallowed media feature names.
    // media-feature-name-no-vendor-prefix: Disallow vendor prefixes for media feature names.
    // media-feature-name-value-whitelist: Specify a whitelist of allowed media feature name and value pairs.
    // media-feature-name-whitelist: Specify a whitelist of allowed media feature names.
    // Custom media
    // custom-media-pattern: Specify a pattern for custom media query names.
    // At-rule
    // at-rule-blacklist: Specify a blacklist of disallowed at-rules.
    // at-rule-no-vendor-prefix: Disallow vendor prefixes for at-rules.
    // at-rule-property-requirelist: Specify a requirelist of properties for an at-rule.
    // at-rule-whitelist: Specify a whitelist of allowed at-rules.
    // Comment
    // comment-word-blacklist: Specify a blacklist of disallowed words within comments.
    // General / Sheet
    // max-nesting-depth: Limit the depth of nesting.
    // no-unknown-animations: Disallow unknown animations.
    // Stylistic issues
    // Color
    // color-hex-case: Specify lowercase or uppercase for hex colors (Autofixable).
    'color-hex-case': 'lower',
    // color-hex-length: Specify short or long notation for hex colors (Autofixable).
    'color-hex-length': 'long',
    // Font family
    // font-family-name-quotes: Specify whether or not quotation marks should be used around font family names.
    // Font weight
    // font-weight-notation: Require numeric or named (where possible) font-weight values. Also, when named values are expected, require only valid names.
    // Function
    // function-comma-newline-after: Require a newline or disallow whitespace after the commas of functions (Autofixable).
    // function-comma-newline-before: Require a newline or disallow whitespace before the commas of functions (Autofixable).
    // function-comma-space-after: Require a single space or disallow whitespace after the commas of functions (Autofixable).
    // function-comma-space-before: Require a single space or disallow whitespace before the commas of functions (Autofixable).
    // function-max-empty-lines: Limit the number of adjacent empty lines within functions (Autofixable).
    // function-name-case: Specify lowercase or uppercase for function names (Autofixable).
    // function-parentheses-newline-inside: Require a newline or disallow whitespace on the inside of the parentheses of functions (Autofixable).
    // function-parentheses-space-inside: Require a single space or disallow whitespace on the inside of the parentheses of functions (Autofixable).
    // function-url-quotes: Require or disallow quotes for urls.
    // function-whitespace-after: Require or disallow whitespace after functions (Autofixable).
    // Number
    // number-leading-zero: Require or disallow a leading zero for fractional numbers less than 1 (Autofixable).
    // number-no-trailing-zeros: Disallow trailing zeros in numbers (Autofixable).
    // String
    // string-quotes: Specify single or double quotes around strings (Autofixable).
    'string-quotes': 'single',
    // Length
    // length-zero-no-unit: Disallow units for zero lengths (Autofixable).
    // Unit
    // unit-case: Specify lowercase or uppercase for units (Autofixable).
    // Value
    // value-keyword-case: Specify lowercase or uppercase for keywords values (Autofixable).
    // Value list
    // value-list-comma-newline-after: Require a newline or disallow whitespace after the commas of value lists (Autofixable).
    // value-list-comma-newline-before: Require a newline or disallow whitespace before the commas of value lists.
    // value-list-comma-space-after: Require a single space or disallow whitespace after the commas of value lists (Autofixable).
    // value-list-comma-space-before: Require a single space or disallow whitespace before the commas of value lists (Autofixable).
    // value-list-max-empty-lines: Limit the number of adjacent empty lines within value lists (Autofixable).
    // Custom property
    // custom-property-empty-line-before: Require or disallow an empty line before custom properties (Autofixable).
    // Property
    // property-case: Specify lowercase or uppercase for properties (Autofixable).
    // Declaration
    // declaration-bang-space-after: Require a single space or disallow whitespace after the bang of declarations (Autofixable).
    // declaration-bang-space-before: Require a single space or disallow whitespace before the bang of declarations (Autofixable).
    // declaration-colon-newline-after: Require a newline or disallow whitespace after the colon of declarations (Autofixable).
    // declaration-colon-space-after: Require a single space or disallow whitespace after the colon of declarations (Autofixable).
    // declaration-colon-space-before: Require a single space or disallow whitespace before the colon of declarations (Autofixable).
    // declaration-empty-line-before: Require or disallow an empty line before declarations (Autofixable).
    // Declaration block
    // declaration-block-semicolon-newline-after: Require a newline or disallow whitespace after the semicolons of declaration blocks (Autofixable).
    // declaration-block-semicolon-newline-before: Require a newline or disallow whitespace before the semicolons of declaration blocks.
    // declaration-block-semicolon-space-after: Require a single space or disallow whitespace after the semicolons of declaration blocks (Autofixable).
    // declaration-block-semicolon-space-before: Require a single space or disallow whitespace before the semicolons of declaration blocks (Autofixable).
    // declaration-block-trailing-semicolon: Require or disallow a trailing semicolon within declaration blocks (Autofixable).
    // Block
    // block-closing-brace-empty-line-before: Require or disallow an empty line before the closing brace of blocks (Autofixable).
    // block-closing-brace-newline-after: Require a newline or disallow whitespace after the closing brace of blocks (Autofixable).
    // block-closing-brace-newline-before: Require a newline or disallow whitespace before the closing brace of blocks (Autofixable).
    // block-closing-brace-space-after: Require a single space or disallow whitespace after the closing brace of blocks.
    // block-closing-brace-space-before: Require a single space or disallow whitespace before the closing brace of blocks (Autofixable).
    // block-opening-brace-newline-after: Require a newline after the opening brace of blocks (Autofixable).
    // block-opening-brace-newline-before: Require a newline or disallow whitespace before the opening brace of blocks (Autofixable).
    // block-opening-brace-space-after: Require a single space or disallow whitespace after the opening brace of blocks (Autofixable).
    // block-opening-brace-space-before: Require a single space or disallow whitespace before the opening brace of blocks (Autofixable).
    // Selector
    // selector-attribute-brackets-space-inside: Require a single space or disallow whitespace on the inside of the brackets within attribute selectors (Autofixable).
    // selector-attribute-operator-space-after: Require a single space or disallow whitespace after operators within attribute selectors (Autofixable).
    // selector-attribute-operator-space-before: Require a single space or disallow whitespace before operators within attribute selectors (Autofixable).
    // selector-attribute-quotes: Require or disallow quotes for attribute values.
    // selector-combinator-space-after: Require a single space or disallow whitespace after the combinators of selectors (Autofixable).
    // selector-combinator-space-before: Require a single space or disallow whitespace before the combinators of selectors (Autofixable).
    // selector-descendant-combinator-no-non-space: Disallow non-space characters for descendant combinators of selectors (Autofixable).
    // selector-pseudo-class-case: Specify lowercase or uppercase for pseudo-class selectors (Autofixable).
    // selector-pseudo-class-parentheses-space-inside: Require a single space or disallow whitespace on the inside of the parentheses within pseudo-class selectors (Autofixable).
    // selector-pseudo-element-case: Specify lowercase or uppercase for pseudo-element selectors (Autofixable).
    // selector-pseudo-element-colon-notation: Specify single or double colon notation for applicable pseudo-elements (Autofixable).
    // selector-type-case: Specify lowercase or uppercase for type selectors (Autofixable).
    // Selector list
    // selector-list-comma-newline-after: Require a newline or disallow whitespace after the commas of selector lists (Autofixable).
    // selector-list-comma-newline-before: Require a newline or disallow whitespace before the commas of selector lists (Autofixable).
    // selector-list-comma-space-after: Require a single space or disallow whitespace after the commas of selector lists (Autofixable).
    // selector-list-comma-space-before: Require a single space or disallow whitespace before the commas of selector lists (Autofixable).
    // Rule
    // rule-empty-line-before: Require or disallow an empty line before rules (Autofixable).
    'rule-empty-line-before': null,
    // Media feature
    // media-feature-colon-space-after: Require a single space or disallow whitespace after the colon in media features (Autofixable).
    // media-feature-colon-space-before: Require a single space or disallow whitespace before the colon in media features (Autofixable).
    // media-feature-name-case: Specify lowercase or uppercase for media feature names (Autofixable).
    // media-feature-parentheses-space-inside: Require a single space or disallow whitespace on the inside of the parentheses within media features (Autofixable).
    // media-feature-range-operator-space-after: Require a single space or disallow whitespace after the range operator in media features (Autofixable).
    // media-feature-range-operator-space-before: Require a single space or disallow whitespace before the range operator in media features (Autofixable).
    // Media query list
    // media-query-list-comma-newline-after: Require a newline or disallow whitespace after the commas of media query lists (Autofixable).
    // media-query-list-comma-newline-before: Require a newline or disallow whitespace before the commas of media query lists.
    // media-query-list-comma-space-after: Require a single space or disallow whitespace after the commas of media query lists (Autofixable).
    // media-query-list-comma-space-before: Require a single space or disallow whitespace before the commas of media query lists (Autofixable).
    // At-rule
    // at-rule-empty-line-before: Require or disallow an empty line before at-rules (Autofixable).
    // at-rule-name-case: Specify lowercase or uppercase for at-rules names (Autofixable).
    // at-rule-name-newline-after: Require a newline after at-rule names.
    // at-rule-name-space-after: Require a single space after at-rule names (Autofixable).
    // at-rule-semicolon-newline-after: Require a newline after the semicolon of at-rules (Autofixable).
    // at-rule-semicolon-space-before: Require a single space or disallow whitespace before the semicolons of at-rules.
    // Comment
    // comment-empty-line-before: Require or disallow an empty line before comments (Autofixable).
    'comment-empty-line-before': null,
    // comment-whitespace-inside: Require or disallow whitespace on the inside of comment markers (Autofixable).
    // General / Sheet
    // indentation: Specify indentation (Autofixable).
    'indentation': 2
    // linebreaks: Specify unix or windows linebreaks (Autofixable).
    // max-empty-lines: Limit the number of adjacent empty lines (Autofixable).
    // max-line-length: Limit the length of a line.
    // no-eol-whitespace: Disallow end-of-line whitespace (Autofixable).
    // no-missing-end-of-source-newline: Disallow missing end-of-source newlines (Autofixable).
    // no-empty-first-line: Disallow empty first lines (Autofixable).
    // unicode-bom: Require or disallow Unicode BOM.
  }
};
