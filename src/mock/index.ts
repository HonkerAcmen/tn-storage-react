/**
 * Mock 数据配置
 *
 * openMock: Mock 数据开关
 * - true: 使用 Mock 数据（开发/测试环境）
 * - false: 使用真实 API（生产环境）
 *
 * 切换方式：
 * 1. 开发环境：设置为 true
 * 2. 生产环境：设置为 false 并确保后端 API 可用
 */
export const openMock = false;

// 导出 Mock 服务函数
export * from './mockService';
