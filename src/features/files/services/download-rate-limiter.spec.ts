import { describe, expect, it } from 'vitest';
import {
  computeThrottleWaitMs,
  createDownloadRateLimiter,
} from './download-rate-limiter';

describe('download-rate-limiter', () => {
  it('不限速时不等待', () => {
    expect(computeThrottleWaitMs(1024, 0, 1000, 1000)).toEqual({
      waitMs: 0,
      nextAvailableAtMs: 1000,
    });
  });

  it('应按 KB/s 计算等待时间', () => {
    const oneMb = 1024 * 1024;
    const result = computeThrottleWaitMs(oneMb, 1024, 0, 0);
    expect(result.waitMs).toBe(1000);
    expect(result.nextAvailableAtMs).toBe(1000);
  });

  it('连续下载应累积等待窗口', async () => {
    const limiter = createDownloadRateLimiter(1024);
    const waits: number[] = [];
    const originalSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = ((handler: TimerHandler, timeout?: number) => {
      waits.push(timeout ?? 0);
      if (typeof handler === 'function') {
        handler();
      }
      return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as unknown as typeof setTimeout;

    try {
      const oneMb = 1024 * 1024;
      await limiter.throttle(oneMb, 0);
      await limiter.throttle(oneMb, 0);
      expect(waits).toEqual([1000, 2000]);
    } finally {
      globalThis.setTimeout = originalSetTimeout;
    }
  });
});
