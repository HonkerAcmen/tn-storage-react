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

export const ICON_SIZE_SMALL = 'h-6 w-6';
export const ICON_SIZE_MEDIUM = 'h-8 w-8';
export const ICON_SIZE_LARGE = 'h-16 w-16';

/**
 * 文件图标映射（小尺寸）
 */
export const FILE_ICON_MAP_SMALL: Record<string, JSX.Element> = {
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
export const FILE_ICON_MAP_LARGE: Record<string, JSX.Element> = {
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
  size: 'small' | 'large' = 'small'
): JSX.Element {
  const iconMap = size === 'small' ? FILE_ICON_MAP_SMALL : FILE_ICON_MAP_LARGE;
  return iconMap[ext || ''] || iconMap['other'];
}

