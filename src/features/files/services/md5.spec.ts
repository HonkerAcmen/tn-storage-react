import { describe, expect, it } from 'vitest';
import { IncrementalMd5, md5ArrayBuffer } from './md5';

describe('md5', () => {
  it('空字符串', () => {
    expect(md5ArrayBuffer(new ArrayBuffer(0))).toBe(
      'd41d8cd98f00b204e9800998ecf8427e',
    );
  });

  it('hello', () => {
    const encoder = new TextEncoder();
    expect(md5ArrayBuffer(encoder.encode('hello').buffer)).toBe(
      '5d41402abc4b2a76b9719d911017c592',
    );
  });

  it('分块与一次性结果一致', () => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode('chunked-md5-test');
    const single = md5ArrayBuffer(bytes.buffer);

    const hasher = new IncrementalMd5();
    hasher.append(bytes.buffer.slice(0, 6));
    hasher.append(bytes.buffer.slice(6));
    expect(hasher.end()).toBe(single);
  });
});
