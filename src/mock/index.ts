import { generateFileSystem } from './randomFileData';

// Mock 数据开关：设置为 true 时使用假数据，false 时使用真实 API
export const openMock = true;

// 当 openMock 为 true 时，导出假数据
export const fileDatas = openMock ? generateFileSystem(3, 6) : null;
