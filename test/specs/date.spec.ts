import { describe, it, expect, afterEach, vi } from 'vitest';
import { addMonths, calendarDays, daysInMonth, formatYmd, isValidDateValue, today, toYmd } from '@/internal/date';

describe('internal/date', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('daysInMonth', () => {
    it('returns the days of the month, including leap years', () => {
      expect(daysInMonth(2026, 1)).toBe(31);
      expect(daysInMonth(2026, 2)).toBe(28);
      expect(daysInMonth(2024, 2)).toBe(29);
      expect(daysInMonth(2026, 4)).toBe(30);
    });
  });

  describe('isValidDateValue', () => {
    it.each([
      ['20260930', 'yyyyMMdd', true],
      ['20260931', 'yyyyMMdd', false],
      ['20240229', 'yyyyMMdd', true],
      ['20260229', 'yyyyMMdd', false],
      ['20261301', 'yyyyMMdd', false],
      ['2026093', 'yyyyMMdd', false],
      ['2026_930', 'yyyyMMdd', false],
      ['235959', 'HHmmss', true],
      ['240000', 'HHmmss', false],
      ['2360', 'HHmm', false],
      ['0229', 'MMdd', true],
      ['202609', 'yyyyMM', true],
      ['20260930123456789', 'yyyyMMddHHmmssSSS', true]
    ])('%s with %s is %s', (value, format, expected) => {
      expect(isValidDateValue(value, format)).toBe(expected);
    });
  });

  describe('toYmd', () => {
    const base = {
      year: 2026,
      month: 9,
      day: 30
    };

    it('extracts the date from a value', () => {
      expect(toYmd('20240102', 'yyyyMMdd', base)).toEqual({
        year: 2024,
        month: 1,
        day: 2
      });
      expect(toYmd('20240102103000', 'yyyyMMddHHmmss', base)).toEqual({
        year: 2024,
        month: 1,
        day: 2
      });
    });

    it('uses the year of today for a format without the year', () => {
      expect(toYmd('0102', 'MMdd', base)).toEqual({
        year: 2026,
        month: 1,
        day: 2
      });
    });

    it('returns null for an invalid value or a format without the date', () => {
      expect(toYmd('20260931', 'yyyyMMdd', base)).toBeNull();
      expect(toYmd('', 'yyyyMMdd', base)).toBeNull();
      expect(toYmd('1030', 'HHmm', base)).toBeNull();
    });
  });

  describe('addMonths', () => {
    it('moves the month across years, keeping the day within the month', () => {
      expect(addMonths({
        year: 2026,
        month: 1,
        day: 31
      }, 1)).toEqual({
        year: 2026,
        month: 2,
        day: 28
      });
      expect(addMonths({
        year: 2026,
        month: 1,
        day: 15
      }, -1)).toEqual({
        year: 2025,
        month: 12,
        day: 15
      });
      expect(addMonths({
        year: 2026,
        month: 9,
        day: 30
      }, 12)).toEqual({
        year: 2027,
        month: 9,
        day: 30
      });
    });
  });

  describe('calendarDays', () => {
    it('returns 42 days from the Sunday of the week containing the first day', () => {
      // 2026-09-01は火曜
      const days = calendarDays(2026, 9);
      expect(days).toHaveLength(42);
      expect(formatYmd(days[0]!.ymd)).toBe('20260830');
      expect(days[0]!.weekday).toBe(0);
      expect(days[0]!.outOfRange).toBe(true);
      expect(formatYmd(days[2]!.ymd)).toBe('20260901');
      expect(days[2]!.outOfRange).toBe(false);
    });

    it('starts from the previous week when the first day is a Sunday', () => {
      // 2026-02-01は日曜
      const days = calendarDays(2026, 2);
      expect(formatYmd(days[0]!.ymd)).toBe('20260125');
      expect(formatYmd(days[7]!.ymd)).toBe('20260201');
    });
  });

  describe('today', () => {
    it('returns the date in the given time zone', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-09-30T20:00:00Z'));
      expect(today('Asia/Tokyo')).toEqual({
        year: 2026,
        month: 10,
        day: 1
      });
      expect(today('America/Los_Angeles')).toEqual({
        year: 2026,
        month: 9,
        day: 30
      });
    });
  });
});
