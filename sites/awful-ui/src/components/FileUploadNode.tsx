// FileUploadNode.tsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';

import useMythicaApi from '../hooks/useMythicaApi'; // Import Auth context
import useAwfulFlow  from '../hooks/useAwfulFlow'; // Import NodeDataContext

interface FileUploadNodeProps {
  id: string;
}

const UPLOAD_FILES = 'uploadFiles';

const FileUploadNode: React.FC<FileUploadNodeProps> = ({ id }) => {
  const { uploadFile } = useMythicaApi(); // Access the authentication key from context
  const { setFlowData, notifyTargets } = useAwfulFlow();
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
      notifyTargets(id, UPLOAD_FILES, files);
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

      <div
        className="file-handle"
        style={{
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <Handle
            type="source"
            position={Position.Bottom}
            id={UPLOAD_FILES}
            isConnectable
            style={{ background: '#555' }}
        />
        <span className="label">Uploads[ ]</span>
      </div>

    </div>
  );
};

export default FileUploadNode;
