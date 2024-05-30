import { Box, Typography, Button, Table, styled } from '@mui/joy';
import { LucideUploadCloud } from 'lucide-react';

const uploads = [
  { name: 'File1.jpg', size: '1MB', hash: 'abc123', date: '2024-05-25' },
  { name: 'File2.png', size: '2MB', hash: 'def456', date: '2024-05-26' }
];

const VisuallyHiddenInput = styled('input')`
clip: rect(0 0 0 0);
clip-path: inset(50%);
height: 1px;
overflow: hidden;
position: absolute;
bottom: 0;
left: 0;
white-space: nowrap;
width: 1px;
`;


const Uploads = () => {
  return (
    <Box>
      <Typography level="h2">Uploads</Typography>
      <Button
                    variant="plain"
                    color="neutral"
                    startDecorator={<LucideUploadCloud/>}>
                    Upload a file
                    <VisuallyHiddenInput type="file"/>
                </Button>
      <Table aria-label="basic table">
        <thead>
          <tr>
            <th>Upload Name</th>
            <th>Size</th>
            <th>Hash</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {uploads.map(upload => (
            <tr key={upload.hash}>
              <td>{upload.name}</td>
              <td>{upload.size}</td>
              <td>{upload.hash}</td>
              <td>{upload.date}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
};

export default Uploads;