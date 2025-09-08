import { describe, it, expect } from 'vitest';
import { normalizeAddress, calcMatchScore, findBestMatch } from '../app/utils';

describe('normalizeAddress', () => {
  it('replaces Japanese address parts with hyphens', () => {
    expect(normalizeAddress('1丁目2番地3号')).toBe('1-2-3');
  });

  it('removes spaces, fullwidth numbers, and room numbers', () => {
    expect(normalizeAddress(' １丁目 ２番地３号 １０１号室')).toBe('1-2-3');
  });
});

describe('calcMatchScore', () => {
  it('returns 100 for identical addresses', () => {
    expect(calcMatchScore('1丁目2番地3号', '1丁目2番地3号')).toBe(100);
  });

  it('returns a partial score for near matches', () => {
    expect(calcMatchScore('1丁目2番地3号', '1丁目2番地4号')).toBe(80);
  });

  it('returns 0 for completely different addresses', () => {
    expect(calcMatchScore('', '1丁目2番地3号')).toBe(0);
  });
});

describe('findBestMatch', () => {
  it('returns 100 when search term matches address', () => {
    expect(findBestMatch('1丁目2番地3号', '1丁目2番地3号', 'サンプルマンション')).toBe(100);
  });

  it('returns 100 when search term matches full address including apartment', () => {
    expect(findBestMatch('1丁目2番地3号サンプルマンション', '1丁目2番地3号', 'サンプルマンション')).toBe(100);
  });

  it('returns 0 when search term is empty', () => {
    expect(findBestMatch('', '1丁目2番地3号', 'サンプルマンション')).toBe(0);
  });
});
