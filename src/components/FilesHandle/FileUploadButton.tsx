import { ChangeEvent, useRef } from 'react';
interface FileUploadButtonProps {
  accept?: string;
  multiple?: boolean;
  isFolderSelect?: boolean;
  uploading?: boolean;
  children?: React.ReactNode;
  onFileSelect: (files: FileList | null) => void; // 单个文件或多个文件 FileList为内置类型
}

export default function FileUploadButton({
  accept = '*',
  multiple = false,
  children = '选择文件',
  uploading = false,
  isFolderSelect,
  onFileSelect,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (onFileSelect) {
      onFileSelect(files);
    }

    // 清空上次选择的文件
    e.target.value = '';
  }
  function handleClick() {
    inputRef.current?.click();
  }

  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      <button
        disabled={isFolderSelect}
        onClick={handleClick}
        className={`h-8 w-24 ${!uploading ? 'cursor-no-drop bg-gray-300 hover:bg-gray-400' : 'cursor-pointer'} ${isFolderSelect ? 'cursor-no-drop bg-gray-300 hover:bg-gray-400' : 'cursor-pointer'} rounded-lg bg-[#5542f6] text-white transition duration-200 hover:bg-[#4532e6]`}
      >
        {children}
      </button>
    </div>
  );
}
