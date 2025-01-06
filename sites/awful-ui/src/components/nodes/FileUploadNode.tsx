// FileUploadNode.tsx
import React, { memo } from 'react';

import useMythicaApi from '../../hooks/useMythicaApi'; // Import Auth context
import useAwfulFlow from '../../hooks/useAwfulFlow'; // Import NodeDataContext
import FileOutputHandle from '../handles/FileOutputHandle';
import { Box, Button, Card, List, ListItem, Typography } from '@mui/joy';
import { NodeDeleteButton } from '../NodeDeleteButton';
import { useReactFlow } from '@xyflow/react';

interface FileUploadNodeProps {
  id: string;
  selected?: boolean;
}

const UPLOAD_FILES = 'uploadFiles';

const FileUploadNode: React.FC<FileUploadNodeProps> = (node) => {
  const { uploadFile } = useMythicaApi(); // Access the authentication key from context
  const { setFlowData } = useAwfulFlow();
  const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(
    null
  );
  const [uploadStatus, setUploadStatus] = React.useState<string>('');
  const { deleteElements } = useReactFlow();

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
      setFlowData(node.id, UPLOAD_FILES, files);
      setUploadStatus('Files uploaded successfully');
    } catch (error) {
      console.error('File upload error:', error);
      setUploadStatus('Upload failed');
    }
  };

  return (
    <Card
      className={`mythica-node file-upload-node ${node.selected && 'selected'}`}
      sx={{ minWidth: '300px' }}
    >
      <NodeDeleteButton
        onDelete={() => {
          deleteElements({ nodes: [node] });
        }}
      />
      <Typography level="h4">File Upload</Typography>
      <Button
        variant="outlined"
        component="label"
        sx={{ width: 'fit-content' }}
      >
        Choose files
        <input type="file" multiple onChange={handleFileChange} hidden />
      </Button>
      {selectedFiles && Array.from(selectedFiles).length > 0 && (
        <Box>
          <List marker="disc" sx={{ pl: '20px', py: 0 }}>
            {Array.from(selectedFiles).map((file, index) => (
              <ListItem key={index} sx={{ py: 0, height: '30px' }}>
                <Typography fontSize={14}>{file.name}</Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      {selectedFiles && (
        <Button onClick={handleFileUpload}>Upload Files</Button>
      )}
      <p>{uploadStatus}</p>
      <FileOutputHandle
        id={UPLOAD_FILES}
        left="50%"
        isConnectable
        style={{ background: '#555' }}
        label="Uploads[ ]"
      />
    </Card>
  );
};

export default memo(FileUploadNode);
