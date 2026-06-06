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
import {
  ICON_SIZE_SMALL,
  ICON_SIZE_MEDIUM,
  ICON_SIZE_LARGE,
} from '@/utils/constants/fileConstants';

type FileIconKind =
  | 'pdf'
  | 'doc'
  | 'xlsx'
  | 'zip'
  | 'image'
  | 'video'
  | 'audio'
  | 'default';

const EXT_TO_KIND: Record<string, FileIconKind> = {
  pdf: 'pdf',
  doc: 'doc',
  docx: 'doc',
  xlsx: 'xlsx',
  zip: 'zip',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  mp4: 'video',
  mov: 'video',
  mp3: 'audio',
  wav: 'audio',
};

function resolveFileIconKind(ext?: string): FileIconKind {
  if (!ext) {
    return 'default';
  }
  return EXT_TO_KIND[ext.toLowerCase()] ?? 'default';
}

function FileIconGlyph({
  kind,
  sizeClass,
}: {
  kind: FileIconKind;
  sizeClass: string;
}) {
  const className = `file-type-icon file-type-icon--${kind} ${sizeClass}`;

  switch (kind) {
    case 'pdf':
      return <AiFillFilePdf className={className} />;
    case 'doc':
      return <AiFillFileText className={className} />;
    case 'xlsx':
      return <AiFillFileExcel className={className} />;
    case 'zip':
      return <AiFillFileZip className={className} />;
    case 'image':
      return <AiOutlineFileImage className={className} />;
    case 'video':
      return <AiFillPlaySquare className={className} />;
    case 'audio':
      return <AiFillMuted className={className} />;
    default:
      return <AiFillFileUnknown className={className} />;
  }
}

/** jpg 扩展名沿用专用图标 */
function FileIconByExt({
  ext,
  sizeClass,
}: {
  ext?: string;
  sizeClass: string;
}) {
  const normalized = ext?.toLowerCase();
  if (normalized === 'jpg' || normalized === 'jpeg') {
    return (
      <AiOutlineFileJpg
        className={`file-type-icon file-type-icon--image ${sizeClass}`}
      />
    );
  }
  if (normalized === 'txt' || normalized === 'json') {
    return (
      <AiFillFileText
        className={`file-type-icon file-type-icon--default ${sizeClass}`}
      />
    );
  }

  return (
    <FileIconGlyph kind={resolveFileIconKind(ext)} sizeClass={sizeClass} />
  );
}

/**
 * 获取文件图标
 */
export function getFileIcon(
  ext: string | undefined,
  size: 'small' | 'medium' | 'large',
): JSX.Element {
  const sizeClass =
    size === 'large'
      ? ICON_SIZE_LARGE
      : size === 'medium'
        ? ICON_SIZE_MEDIUM
        : ICON_SIZE_SMALL;

  return <FileIconByExt ext={ext} sizeClass={sizeClass} />;
}

export { ICON_SIZE_SMALL, ICON_SIZE_MEDIUM, ICON_SIZE_LARGE };
