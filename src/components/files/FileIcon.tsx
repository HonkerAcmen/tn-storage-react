import type { JSX } from 'react';
import {
  AiFillFileExcel,
  AiFillFilePdf,
  AiFillFileText,
  AiFillFileUnknown,
  AiFillFileZip,
  AiFillMuted,
  AiFillPlaySquare,
  AiOutlineFileImage,
  AiOutlineFileJpg,
} from 'react-icons/ai';
import { ICON_SIZE_SMALL, ICON_SIZE_MEDIUM, ICON_SIZE_LARGE } from '../../utils/constants/fileConstants';

/**
 * 文件图标组件
 */

/**
 * 文件图标映射（小尺寸）
 */
const FILE_ICON_MAP_SMALL: Record<string, JSX.Element> = {
  txt: <AiFillFileText className={`${ICON_SIZE_SMALL} text-gray-400`} />,
  pdf: <AiFillFilePdf className={`${ICON_SIZE_SMALL} text-red-400`} />,
  jpg: <AiOutlineFileJpg className={`${ICON_SIZE_SMALL} text-gray-400`} />,
  png: <AiOutlineFileImage className={`${ICON_SIZE_SMALL} text-gray-400`} />,
  mp4: <AiFillPlaySquare className={`${ICON_SIZE_SMALL} text-gray-400`} />,
  mp3: <AiFillMuted className={`${ICON_SIZE_SMALL} text-gray-400`} />,
  json: <AiFillFileText className={`${ICON_SIZE_SMALL} text-gray-400`} />,
  zip: <AiFillFileZip className={`${ICON_SIZE_SMALL} text-amber-400`} />,
  doc: <AiFillFileText className={`${ICON_SIZE_SMALL} text-blue-400`} />,
  docx: <AiFillFileText className={`${ICON_SIZE_SMALL} text-blue-400`} />,
  xlsx: <AiFillFileExcel className={`${ICON_SIZE_SMALL} text-green-400`} />,
  other: <AiFillFileUnknown className={`${ICON_SIZE_SMALL} text-gray-400`} />,
};

/**
 * 文件图标映射（大尺寸）
 */
const FILE_ICON_MAP_LARGE: Record<string, JSX.Element> = {
  txt: <AiFillFileText className={`${ICON_SIZE_LARGE} text-gray-400`} />,
  pdf: <AiFillFilePdf className={`${ICON_SIZE_LARGE} text-red-400`} />,
  jpg: <AiOutlineFileJpg className={`${ICON_SIZE_LARGE} text-gray-400`} />,
  png: <AiOutlineFileImage className={`${ICON_SIZE_LARGE} text-gray-400`} />,
  mp4: <AiFillPlaySquare className={`${ICON_SIZE_LARGE} text-gray-400`} />,
  mp3: <AiFillMuted className={`${ICON_SIZE_LARGE} text-gray-400`} />,
  json: <AiFillFileText className={`${ICON_SIZE_LARGE} text-gray-400`} />,
  zip: <AiFillFileZip className={`${ICON_SIZE_LARGE} text-amber-400`} />,
  doc: <AiFillFileText className={`${ICON_SIZE_LARGE} text-blue-400`} />,
  docx: <AiFillFileText className={`${ICON_SIZE_LARGE} text-blue-400`} />,
  xlsx: <AiFillFileExcel className={`${ICON_SIZE_LARGE} text-green-400`} />,
  other: <AiFillFileUnknown className={`${ICON_SIZE_LARGE} text-gray-400`} />,
};

/**
 * 获取文件图标
 */
export function getFileIcon(
  ext: string | undefined,
  size: 'small' | 'medium' | 'large' = 'small'
): JSX.Element {
  if (size === 'large') {
    return FILE_ICON_MAP_LARGE[ext || ''] || FILE_ICON_MAP_LARGE['other'];
  }
  return FILE_ICON_MAP_SMALL[ext || ''] || FILE_ICON_MAP_SMALL['other'];
}

// 导出常量供其他组件使用
export { ICON_SIZE_SMALL, ICON_SIZE_MEDIUM, ICON_SIZE_LARGE };

