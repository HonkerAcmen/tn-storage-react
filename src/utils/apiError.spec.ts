import { describe, expect, it } from 'vitest';
import { ApiError, getApiErrorMessage, normalizeApiError } from './apiError';

describe('getApiErrorMessage', () => {
  it('应解析标准 NestJS 错误体', () => {
    expect(
      getApiErrorMessage({ code: 400, message: '旧密码错误' }, '操作失败'),
    ).toBe('旧密码错误');
  });

  it('应解析 message 内嵌 HttpException 的错误体', () => {
    const nested = {
      code: -1,
      message: {
        response: {
          code: 400,
          message: '旧密码错误',
        },
        status: 400,
        message: '旧密码错误',
        name: 'HttpException',
      },
      data: null,
    };

    expect(getApiErrorMessage(nested, '密码修改失败')).toBe('旧密码错误');
  });

  it('ApiError 应优先使用 body 中的业务文案', () => {
    const err = new ApiError('请求失败', {
      status: 400,
      body: { code: 400, message: '旧密码错误' },
    });

    expect(getApiErrorMessage(err, '密码修改失败')).toBe('旧密码错误');
  });

  it('normalizeApiError 应输出可读 message', () => {
    const err = normalizeApiError(
      {
        code: -1,
        message: {
          message: '旧密码错误',
        },
      },
      400,
    );

    expect(err.message).toBe('旧密码错误');
  });
});
