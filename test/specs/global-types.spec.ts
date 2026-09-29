// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const LIB = fileURLToPath(new URL('../../lib/', import.meta.url));

describe('lib/global.d.ts', () => {
  it('refers to a declaration file that exists in lib', () => {
    const content = readFileSync(`${LIB}global.d.ts`, 'utf8');
    const matched = content.match(/import\('([^']+)'\)/);
    expect(matched).not.toBeNull();
    expect(existsSync(`${LIB}${matched![1]}.d.ts`)).toBe(true);
  });
});
