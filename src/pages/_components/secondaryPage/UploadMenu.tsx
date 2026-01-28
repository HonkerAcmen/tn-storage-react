import { useFileData } from '@/contexts/FileDataContext';
import { Modal } from 'antd';
import { FolderItem } from '../tools/FolderItem';
import { useState } from 'react';

interface UploadMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function UploadMenu({ open, onClose }: UploadMenuProps) {
  const { allFiles } = useFileData();
  const [selectKey, setSelectKey] = useState('');
  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={700}
      title={<div>选择要上传的文件夹</div>}
    >
      <ul>
        {allFiles.map((item) => (
          <FolderItem
            key={item.UUID}
            item={item}
            selectKey={selectKey}
            onSelect={(key: string) => setSelectKey(key)}
          />
        ))}
      </ul>
    </Modal>
  );
}
