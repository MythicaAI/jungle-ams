import {Box, Typography, Button, Table, styled} from '@mui/joy';
import {LucideUploadCloud} from 'lucide-react';
import {ChangeEvent, FormEvent, useState} from "react";
import {v4} from "uuid";

const uploads = [
    {name: 'File1.jpg', size: '1MB', hash: 'abc123', date: '2024-05-25'},
    {name: 'File2.png', size: '2MB', hash: 'def456', date: '2024-05-26'}
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
    const [filesSelected, setFilesSelected] = useState<File[]>() // also tried <string | Blob>

    const handleFileChanged = function (e: React.ChangeEvent<HTMLInputElement>) {
        const fileList = (document.getElementById("file-input") as HTMLInputElement).files;
        //const fileList = e.target.files;
        if (!fileList) {
            console.log("no fileList found")
            return;
        }
        const currentFileList: File[] = filesSelected ?? [];
        const updatedFileList = [...currentFileList, ...fileList];
        for (const file of updatedFileList) {
            console.log("upload via " + e + ", file: " + file.name + ", " + file.size);
        }
        setFilesSelected(updatedFileList);
        uploadFile();
    };

    const submit = function(formData: FormData) {// Assuming fileInput is an HTMLInputElement of type file
        fetch('https://localhost:5555/api/v1/upload/store', {
          method: 'POST',
          body: formData,
        })
          .then(response => response.json())
          .then(data => console.log(data))
          .catch(error => console.error('Error:', error));
    }

    const uploadFile = function () {
        if (filesSelected) {
            const formData = new FormData();
            for (let i = 0; i < filesSelected.length; ++i) {
                const inputName = `hda[${i}]`;
                formData.append(inputName, filesSelected[i], filesSelected[i].name);
            }
            submit(formData);
        }
    };

    const SubmitUploads = function () {
        if (!filesSelected) {
            return "";
        } else {
            return (
                filesSelected.map(file => (
                <tr key={v4()}>
                    <td>
                        {file.name}
                    </td>
                    <td>
                        {file.size}
                    </td>
                    <td>
                        Unknown
                    </td>
                </tr>)));
        }
    }

    return (
        <Box>
            <Typography level="h2">Uploads</Typography>
            <Button
                component="label"
                role={undefined}
                tabIndex={-1}
                variant="plain"
                color="neutral"
                startDecorator={<LucideUploadCloud/>}>
                Upload a file
                <VisuallyHiddenInput type="file" id="file-input" accept=".hda" multiple={true} onChange={handleFileChanged}/>
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
                {<SubmitUploads />}
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