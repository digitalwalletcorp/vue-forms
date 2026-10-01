import { describe, it, expect } from 'vitest';
import { VueFormsError } from '@/errors';
import * as Validation from '@/validation';
import { clearErrors, containsError, doValidate, extractErrors } from '@/validation';
import type { ValidationError, ValidationRule } from '@/validation';

describe('validation', () => {
  describe('doValidate', () => {
    it('records the error under the rule key and returns false', () => {
      const errors: ValidationError = {};
      const rules: Record<string, ValidationRule[]> = {
        name: [{ rule: true, code: 'code.W001', bind: ['item.name'] }],
        age: [{ rule: false, code: 'code.W001' }]
      };
      expect(doValidate(errors, rules)).toBe(false);
      expect(errors).toEqual({
        name: [{
          key: undefined,
          code: 'code.W001',
          bind: ['item.name'],
          ruleId: undefined
        }]
      });
    });

    it('returns true when no rule is violated', () => {
      const errors: ValidationError = {};
      expect(doValidate(errors, { name: [{ rule: false, code: 'code.W001' }] })).toBe(true);
      expect(errors).toEqual({});
    });

    it('treats a false rule as an error when the condition is valid', () => {
      const errors: ValidationError = {};
      expect(doValidate(errors, { name: [{ rule: false, code: 'code.W001', condition: 'valid' }] })).toBe(false);
      expect(Object.keys(errors)).toEqual(['name']);
    });

    it('records array rules under indexed keys', () => {
      const errors: ValidationError = {};
      doValidate(errors, { rows: [{ rule: [false, true], code: 'code.W002' }] });
      expect(Object.keys(errors)).toEqual(['rows[1]']);
    });

    it('validates only the given items and clears their previous errors', () => {
      const errors: ValidationError = {
        name: [{ code: 'old' }],
        age: [{ code: 'old' }]
      };
      const rules: Record<string, ValidationRule[]> = {
        name: [{ rule: false, code: 'code.W001' }],
        age: [{ rule: true, code: 'code.W001' }]
      };
      expect(doValidate(errors, rules, 'name')).toBe(true);
      expect(Object.keys(errors)).toEqual(['age']);
      expect(errors.age![0]!.code).toBe('old');
    });

    it('skips a rule whose prerequisite rule has already failed', () => {
      const errors: ValidationError = {};
      doValidate(errors, {
        name: [
          { rule: true, code: 'code.W001', ruleId: 'required' },
          { rule: true, code: 'code.W002', prerequisite: 'required' }
        ]
      });
      expect(errors.name!.map(item => item.code)).toEqual(['code.W001']);
    });

    it('skips an array rule whose prerequisite rule of another key has failed in the same row', () => {
      const errors: ValidationError = {};
      doValidate(errors, {
        quantity: [{ rule: [true, false], code: 'code.W001', ruleId: 'required' }],
        price: [{ rule: [true, true], code: 'code.W002', prerequisite: 'quantity.required' }]
      });
      expect(Object.keys(errors).sort()).toEqual(['price[1]', 'quantity[0]']);
    });

    it('skips a rule checked with index whose prerequisite rule of the same key has failed', () => {
      const errors: ValidationError = {};
      doValidate(errors, {
        quantity: [
          { rule: true, code: 'code.W001', ruleId: 'required' },
          { rule: true, code: 'code.W002', prerequisite: 'required' }
        ]
      }, 'quantity', 1);
      expect(errors).toEqual({
        'quantity[1]': [{
          key: undefined,
          code: 'code.W001',
          bind: undefined,
          ruleId: 'required[1]'
        }]
      });
    });

    it('skips a rule checked with index whose prerequisite rule of another key has failed', () => {
      const errors: ValidationError = {};
      doValidate(errors, {
        quantity: [{ rule: true, code: 'code.W001', ruleId: 'required' }],
        price: [{ rule: true, code: 'code.W002', prerequisite: 'quantity.required' }]
      }, ['quantity', 'price'], 1);
      expect(Object.keys(errors)).toEqual(['quantity[1]']);
    });

    it('skips an array rule whose prerequisite rule of a key without rows has failed', () => {
      const errors: ValidationError = {};
      doValidate(errors, {
        customer: [{ rule: true, code: 'code.W001', ruleId: 'required' }],
        price: [{ rule: [true, true], code: 'code.W002', prerequisite: 'customer.required' }]
      });
      expect(Object.keys(errors)).toEqual(['customer']);
    });

    it('clears only the indexed errors of the given item', () => {
      const errors: ValidationError = {
        'name[0]': [{ code: 'old' }],
        'surname[0]': [{ code: 'old' }],
        'name.first[0]': [{ code: 'old' }]
      };
      doValidate(errors, {
        'name': [{ rule: false, code: 'code.W001' }],
        'name.first': [{ rule: false, code: 'code.W001' }]
      }, 'name');
      expect(Object.keys(errors).sort()).toEqual(['name.first[0]', 'surname[0]']);
    });

    it('throws VueFormsError when the error observer is missing', () => {
      expect(() => doValidate(undefined, {})).toThrow(VueFormsError);
    });

    it('throws VueFormsError when the item is not in the rules', () => {
      expect(() => doValidate({}, {}, 'unknown')).toThrow(VueFormsError);
    });
  });

  describe('containsError', () => {
    it('matches both plain and indexed keys', () => {
      expect(containsError({ 'rows[0]': [{ code: 'x' }] }, ['rows'])).toBe(true);
      expect(containsError({ name: [{ code: 'x' }] }, ['age'])).toBe(false);
    });

    it('does not match a key that only ends with the given key', () => {
      expect(containsError({ 'surname[0]': [{ code: 'x' }] }, ['name'])).toBe(false);
      expect(containsError({ 'rows1]': [{ code: 'x' }] }, ['rows'])).toBe(false);
    });

    it('treats regular expression characters in the key literally', () => {
      expect(containsError({ 'nameXfirst[0]': [{ code: 'x' }] }, ['name.first'])).toBe(false);
      expect(containsError({ 'name.first[0]': [{ code: 'x' }] }, ['name.first'])).toBe(true);
    });
  });

  describe('extractErrors', () => {
    it('returns only the errors of the given keys', () => {
      const errors: ValidationError = {
        name: [{ code: 'x' }],
        age: [{ code: 'y' }]
      };
      expect(extractErrors(errors, ['age'])).toEqual({ age: [{ code: 'y' }] });
      expect(extractErrors(undefined)).toEqual({});
    });
  });

  describe('clearErrors', () => {
    it('clears the errors matching strings and regular expressions', () => {
      const errors: ValidationError = {
        'name': [{ code: 'x' }],
        'rows[0]': [{ code: 'x' }],
        'rows[1]': [{ code: 'x' }],
        'age': [{ code: 'x' }]
      };
      clearErrors(errors, ['name', /^rows\[/]);
      expect(Object.keys(errors)).toEqual(['age']);
    });

    it('clears every error when no key is given, keeping the same object', () => {
      const errors: ValidationError = { name: [{ code: 'x' }] };
      clearErrors(errors);
      expect(errors).toEqual({});
    });
  });

  describe('doValidate', () => {
    it('単純なバリデーション', () => {
      const pageContext = {
        loginId: ''
      };
      const validationRules = (pageContext: any): Record<string, Validation.ValidationRule[]> => {
        return {
          loginId: [
            {
              rule: !pageContext.loginId,
              code: 'code.W001'
            }
          ]
        };
      };
      const errors = {} as Validation.ValidationError;
      const result = Validation.doValidate(errors, validationRules(pageContext));
      expect(result).toBe(false);
    });
    it('同一ルール内に前提条件が設定されている(除外される)', () => {
      const pageContext = {
        loginId: ''
      };
      const validationRules = (pageContext: any): Record<string, Validation.ValidationRule[]> => {
        return {
          loginId: [
            {
              rule: !pageContext.loginId,
              code: 'code.W001',
              ruleId: 'required'
            },
            {
              rule: pageContext.loginId.length !== 10,
              code: 'code.W002',
              prerequisite: 'required'
            }
          ]
        };
      };
      const errors = {} as Validation.ValidationError;
      const result = Validation.doValidate(errors, validationRules(pageContext));
      expect(result).toBe(false);
      expect(errors['loginId']).toEqual([
        {
          code: 'code.W001',
          ruleId: 'required'
        }
      ]);
    });
    it('同一ルール内に前提条件が設定されている(除外されない)', () => {
      const pageContext = {
        loginId: '12345'
      };
      const validationRules = (pageContext: any): Record<string, Validation.ValidationRule[]> => {
        return {
          loginId: [
            {
              rule: !pageContext.loginId,
              code: 'code.W001',
              ruleId: 'required'
            },
            {
              rule: pageContext.loginId.length !== 10,
              code: 'code.W002',
              prerequisite: 'required'
            }
          ]
        };
      };
      const errors = {} as Validation.ValidationError;
      const result = Validation.doValidate(errors, validationRules(pageContext));
      expect(result).toBe(false);
      expect(errors['loginId']).toEqual([
        {
          code: 'code.W002'
        }
      ]);
    });
    it('異なるルールに前提条件が設定されている(除外される)', () => {
      const pageContext = {
        loginId: '',
        password: ''
      };
      const validationRules = (pageContext: any): Record<string, Validation.ValidationRule[]> => {
        return {
          loginId: [
            {
              rule: !pageContext.loginId,
              code: 'code.W001',
              ruleId: 'required'
            }
          ],
          password: [
            {
              rule: !pageContext.password,
              code: 'code.W001',
              prerequisite: 'loginId.required'
            }
          ]
        };
      };
      const errors = {} as Validation.ValidationError;
      const result = Validation.doValidate(errors, validationRules(pageContext));
      expect(result).toBe(false);
      expect(errors['loginId']).toEqual([
        {
          code: 'code.W001',
          ruleId: 'required'
        }
      ]);
      expect(errors['password']).toBeUndefined();
    });
    it('異なるルールに前提条件が設定されている(除外されない)', () => {
      const pageContext = {
        loginId: '12345',
        password: ''
      };
      const validationRules = (pageContext: any): Record<string, Validation.ValidationRule[]> => {
        return {
          loginId: [
            {
              rule: !pageContext.loginId,
              code: 'code.W001',
              ruleId: 'required'
            }
          ],
          password: [
            {
              rule: !pageContext.password,
              code: 'code.W001',
              prerequisite: 'loginId.required'
            }
          ]
        };
      };
      const errors = {} as Validation.ValidationError;
      const result = Validation.doValidate(errors, validationRules(pageContext));
      expect(result).toBe(false);
      expect(errors['loginId']).toBeUndefined();
      expect(errors['password']).toEqual([
        {
          code: 'code.W001'
        }
      ]);
    });
  });

  describe('validateChunk', () => {
    it('単純なバリデーション', () => {
      const pageContext = {
        loginId: ''
      };
      const validationRules = (pageContext: any): Record<string, Validation.ValidationRule[]> => {
        return {
          loginId: [
            {
              rule: !pageContext.loginId,
              code: 'code.W001'
            }
          ]
        };
      };
      const errors = {} as Validation.ValidationError;
      Validation.validateChunk(errors, 'loginId', validationRules(pageContext)['loginId'][0]);
      expect(errors['loginId']).toEqual([
        {
          code: 'code.W001',
          bind: undefined,
          ruleId: undefined
        }
      ]);
    });
    it('同一ルール内に前提条件が設定されている', () => {
      const pageContext = {
        loginId: ''
      };
      const validationRules = (pageContext: any): Record<string, Validation.ValidationRule[]> => {
        return {
          loginId: [
            {
              rule: !pageContext.loginId,
              code: 'code.W001',
              ruleId: 'required'
            },
            {
              rule: pageContext.loginId.length !== 10,
              code: 'code.W002',
              prerequisite: 'required'
            }
          ]
        };
      };
      const errors = {} as Validation.ValidationError;
      // 最初のルールを適用
      Validation.validateChunk(errors, 'loginId', validationRules(pageContext)['loginId'][0]);
      // 2番目のルールを適用
      Validation.validateChunk(errors, 'loginId', validationRules(pageContext)['loginId'][1]);
      // 2番目のルールは前提条件により除外される
      expect(errors['loginId']).toEqual([
        {
          code: 'code.W001',
          bind: undefined,
          ruleId: 'required'
        }
      ]);
    });
    it('異なるルールに前提条件が設定されている', () => {
      const pageContext = {
        loginId: '',
        password: ''
      };
      const validationRules = (pageContext: any): Record<string, Validation.ValidationRule[]> => {
        return {
          loginId: [
            {
              rule: !pageContext.loginId,
              code: 'code.W001',
              ruleId: 'required'
            }
          ],
          password: [
            {
              rule: !pageContext.password,
              code: 'code.W001',
              prerequisite: 'loginId.required'
            }
          ]
        };
      };
      const errors = {} as Validation.ValidationError;
      // loginIdのルールを適用
      Validation.validateChunk(errors, 'loginId', validationRules(pageContext)['loginId'][0]);
      // passwordのルールを適用
      Validation.validateChunk(errors, 'password', validationRules(pageContext)['password'][0]);
      // passwordのルールは前提条件により除外される
      expect(errors['loginId']).toEqual([
        {
          code: 'code.W001',
          bind: undefined,
          ruleId: 'required'
        }
      ]);
    });
  });
});
