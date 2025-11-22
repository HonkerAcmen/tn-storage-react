interface FolderPageProps {
  folderId: string;
}

export default function FolderPage({ folderId }: FolderPageProps) {
  return <div>{folderId}</div>;
}
