import {Box, Typography, Button, Table, styled, Card} from '@mui/joy';
import {LucidePlusCircle, LucideUploadCloud} from 'lucide-react';
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
    const [formData, setFormData] = useState<FormData>();

    const handleFileChanged = function (e: React.ChangeEvent<HTMLInputElement>) {
        const fileList = (document.getElementById("file-input") as HTMLInputElement).files;
        //const fileList = e.target.files;
        if (!fileList) {
            console.log("no fileList found")
            return;
        }

        // push all the form files into the local state
        const currentFileList: File[] = filesSelected ?? [];
        for (let i = 0; i < fileList.length; i++) {
            currentFileList.push(fileList[i]);
        }
        setFilesSelected(currentFileList);
    };

    const submit = function(e) {
        if (!filesSelected) {
            return;
        }
        const formData = new FormData();
        for (let i = 0; i < filesSelected.length; ++i) {
            const inputName = `hda[${i}]`;
            formData.append(inputName, filesSelected[i], filesSelected[i].name);
        }
        setFormData(formData);

        // Assuming fileInput is an HTMLInputElement of type file
        fetch('http://localhost:5555/api/v1/upload/store', {
          method: 'POST',
          body: formData,
        })
          .then(response => response.json())
          .then(data => console.log(data))
          .catch(error => console.error('Error:', error));
    }

    const SubmitUploads = function () {
        if (!filesSelected) {
            return "";
        } else {
            return (<Card><Table aria-label="basic table">
                <thead>
                <tr>
                    <th>Pending upload</th>
                    <th>Size</th>
                </tr>
                </thead>
                <tbody>
                {
                    filesSelected.map(file => (
                        <tr key={v4()}>
                            <td>
                                {file.name}
                            </td>
                            <td>
                                {file.size}
                            </td>
                        </tr>))
                }
                </tbody>
            </Table>
                <Button color="primary" onClick={submit}>
                    Upload {filesSelected.length}
                </Button>
            </Card>);
        }
    }

    return (
        <Box>
            <Button
                component="label"
                variant={"plain"}
                color={"neutral"}
                startDecorator={<LucidePlusCircle/>}>
                New Asset
            </Button>
            <Button
                component="label"
                role={undefined}
                tabIndex={-1}
                variant="plain"
                color="neutral"
                startDecorator={<LucideUploadCloud/>}>
                Upload Files
                <VisuallyHiddenInput type="file" id="file-input" accept=".hda" multiple={true} onChange={handleFileChanged}/>
            </Button>
            {<SubmitUploads />}
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