// FileUploadNode.tsx
import React, { memo } from 'react';

import useMythicaApi from '../hooks/useMythicaApi'; // Import Auth context
import useAwfulFlow  from '../hooks/useAwfulFlow'; // Import NodeDataContext
import FileOutputHandle from './Handles/FileOutputHandle';

interface FileUploadNodeProps {
  id: string;
}

const UPLOAD_FILES = 'uploadFiles';

const FileUploadNode: React.FC<FileUploadNodeProps> = ({ id }) => {
  const { uploadFile } = useMythicaApi(); // Access the authentication key from context
  const { setFlowData } = useAwfulFlow();
  const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadStatus('No file selected');
      return;
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => formData.append('files', file));

    try {
      const response = await uploadFile(formData);
      const files = response.files;
      setFlowData(id, UPLOAD_FILES, files);
      setUploadStatus('Files uploaded successfully');
    } catch (error) {
      console.error('File upload error:', error);
      setUploadStatus('Upload failed');
    }
  };

  return (
    <div className="mythica-node file-upload-node">
      <h3>File Upload</h3>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload Files</button>
      <p>{uploadStatus}</p>
      <FileOutputHandle
        id={UPLOAD_FILES}
        left="50%"
        isConnectable
        style={{ background: '#555' }}
        label="Uploads[ ]"/>
    </div>
  );
};

export default memo(FileUploadNode);
