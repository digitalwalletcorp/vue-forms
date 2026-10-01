import { describe, it, expect } from 'vitest';
import * as FormHelper from '@/internal/form-helper';

describe('form-helper', () => {
  describe('checkAllowType', () => {
    describe('ascii', () => {
      it('正常', () => {
        const result = FormHelper.checkAllowType('abcdefg', 'ascii');
        expect(result).toBe(true);
      });
      it('異常', () => {
        const result = FormHelper.checkAllowType('£abcdefg', 'ascii');
        expect(result).toBe(false);
      });
    });

    describe('number', () => {
      it('正常', () => {
        const result = FormHelper.checkAllowType('1234567890', 'number');
        expect(result).toBe(true);
      });
      it('異常', () => {
        const result = FormHelper.checkAllowType('10.123', 'number');
        expect(result).toBe(false);
      });
    });

    describe('decimal', () => {
      it('正常', () => {
        const result = FormHelper.checkAllowType('10.123', 'decimal');
        expect(result).toBe(true);
      });
      it('異常', () => {
        const result = FormHelper.checkAllowType('abcdefg', 'decimal');
        expect(result).toBe(false);
      });
    });

    describe('alpha', () => {
      it('正常', () => {
        const result = FormHelper.checkAllowType('abcABC', 'alpha');
        expect(result).toBe(true);
      });
      it('異常', () => {
        const result = FormHelper.checkAllowType('abc$ABC', 'alpha');
        expect(result).toBe(false);
      });
    });

    describe('alphanum', () => {
      it('正常', () => {
        const result = FormHelper.checkAllowType('abc123', 'alphanum');
        expect(result).toBe(true);
      });
      it('異常', () => {
        const result = FormHelper.checkAllowType('abc123.000', 'alphanum');
        expect(result).toBe(false);
      });
    });
  });

  describe('checkRegExp', () => {
    it('マッチ(string)', () => {
      const result = FormHelper.checkRegExp('abc: 1001', '100');
      expect(result).toBe(true);
    });
    it('マッチ(RegExp)', () => {
      const result = FormHelper.checkRegExp('abc: 1001', /100/);
      expect(result).toBe(true);
    });
    it('非マッチ(string)', () => {
      const result = FormHelper.checkRegExp('abc: 1001', '200');
      expect(result).toBe(false);
    });
    it('非マッチ(RegExp)', () => {
      const result = FormHelper.checkRegExp('abc: 1001', /200/);
      expect(result).toBe(false);
    });
  });

  describe('filterInput', () => {
    describe('allowType: ascii', () => {
      it('allowType(ascii)', () => {
        const result = FormHelper.filterInput('abcABCあいう009$', {
          allowType: 'ascii'
        });
        expect(result).toBe('abcABC009$');
      });
    });

    describe('allowType: number', () => {
      it('allowType(number) ノーマル', () => {
        const result = FormHelper.filterInput('100,000', {
          allowType: 'number'
        });
        expect(result).toBe('100000');
      });
      it('allowType(number) 符号付き(+)', () => {
        const result = FormHelper.filterInput('+100,000', {
          allowType: 'number'
        });
        expect(result).toBe('+100000');
      });
      it('allowType(decimal) 符号付き(-)', () => {
        const result = FormHelper.filterInput('-100,000', {
          allowType: 'number'
        });
        expect(result).toBe('-100000');
      });
      it('allowType(decimal) 英字含む', () => {
        const result = FormHelper.filterInput('123abc456', {
          allowType: 'number'
        });
        expect(result).toBe('123456');
      });
      it('allowType(decimal) 小数点含む', () => {
        const result = FormHelper.filterInput('100,000.00', {
          allowType: 'number'
        });
        expect(result).toBe('10000000');
      });
    });

    describe('allowType: decimal', () => {
      it('allowType(decimal) ノーマル', () => {
        const result = FormHelper.filterInput('100,000.00', {
          allowType: 'decimal'
        });
        expect(result).toBe('100000.00');
      });
      it('allowType(decimal) 符号付き(+)', () => {
        const result = FormHelper.filterInput('+100,000.00', {
          allowType: 'decimal'
        });
        expect(result).toBe('+100000.00');
      });
      it('allowType(decimal) 符号付き(-)', () => {
        const result = FormHelper.filterInput('-100,000.00', {
          allowType: 'decimal'
        });
        expect(result).toBe('-100000.00');
      });
      it('allowType(decimal) 英字含む', () => {
        const result = FormHelper.filterInput('123abc456', {
          allowType: 'decimal'
        });
        expect(result).toBe('123456');
      });
      it('allowType(decimal) 小数点2つ', () => {
        const result = FormHelper.filterInput('100.200.300', {
          allowType: 'decimal'
        });
        expect(result).toBe('100.200300');
      });
    });

    describe('allowType: alpha', () => {
      it('allowType(alpha)', () => {
        const result = FormHelper.filterInput('abcABCあいう009$', {
          allowType: 'alpha'
        });
        expect(result).toBe('abcABC');
      });
    });

    describe('allowType: alphanum', () => {
      it('allowType(alphanum)', () => {
        const result = FormHelper.filterInput('abcABCあいう009$', {
          allowType: 'alphanum'
        });
        expect(result).toBe('abcABC009');
      });
    });

    describe('allowRegexp: 英数', () => {
      it('allowRegexp', () => {
        const result = FormHelper.filterInput('abcABC999.00', {
          allowRegexp: /^[0-9a-z]+$/
        });
        expect(result).toBe('abc99900');
      });
    });
  });

  describe('resolveLabel', () => {
    it('returns a string as it is', () => {
      expect(FormHelper.resolveLabel('Apple')).toBe('Apple');
    });

    it('calls a function and returns its result', () => {
      expect(FormHelper.resolveLabel(() => 'Fresh apple')).toBe('Fresh apple');
    });
  });
});
