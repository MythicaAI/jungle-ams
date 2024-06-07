    import {Box, Button, Table, styled, Card} from '@mui/joy';
import {LucidePlusCircle, LucideUploadCloud} from 'lucide-react';
import {useEffect, useState} from "react";
import {v4} from "uuid";
import {useCookies} from "react-cookie";
import {AssetCreateRequest, AssetCreateResponse, ProfileResponse} from "./types/apiTypes.ts";
import {getData, postData} from "./services/backendCommon.ts";
import {FileContent} from "./schema_types/media.ts";
import {useGlobalStore} from "./stores/globalStore.ts";
import axios from "axios";
import {format, parseISO} from "date-fns";
import AssetEdit from "./AssetEdit.tsx";

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
    const [cookies, ] = useCookies(['profile_id', 'auth_token'])
    const [profile, setProfile] = useState<ProfileResponse>();
    const {updateAssetCreation, authToken, assetCreation} = useGlobalStore();

    useEffect(() => {
        if (!profile) {
            getData<ProfileResponse>(`profiles/${cookies.user}`).then(r => {
                    setProfile(r);
                }
            ).catch(error => {
                console.error(error);
            });
        }
        if (authToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
            getData<FileContent[]>("upload/pending").then(files => {
                console.log("loading pending uploads")
                updateAssetCreation({pendingFiles: files})
            }).catch(error => {
                console.error(error);
            });
        } else {
            console.log("not authorized yet")
        }
    }, [profile, cookies, updateAssetCreation])

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
    const createAsset = function() {
        if (!assetCreation.asset_id || assetCreation.asset_id === "") {
            const createRequest: AssetCreateRequest = { collection_id: assetCreation.collection_id }
            postData<AssetCreateResponse>('assets/', createRequest).then(r => {
                updateAssetCreation({
                    asset_id: r.id,
                    collection_id: r.collection_id,
                })
            })
        }
    }
    const submit = function() {
        if (!filesSelected) {
            return;
        }
        const formData = new FormData();
        for (let i = 0; i < filesSelected.length; ++i) {
            formData.append('files', filesSelected[i], filesSelected[i].name);
        }
        setFormData(formData);

        // Assuming fileInput is an HTMLInputElement of type file
        fetch('http://localhost:5555/api/v1/upload/store', {
            method: 'POST',
            body: formData,
            headers: {'Authorization': 'Bearer ' + authToken}
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
    };

    const formatISO = (isoString: string): string => {
        const date = parseISO(isoString);
        return format(date, 'PPpp');
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
                    Upload {filesSelected.length} Files
                </Button>
            </Card>);
        }
    }

    return (
        <Box>
            {assetCreation.asset_id ? <Button
                component="label"
                variant={"plain"}
                color={"neutral"}
                onMouseDown={createAsset}
                startDecorator={<LucidePlusCircle/>}>
                New Asset
            </Button> : <AssetEdit/>
            }
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
                    <th>File Name</th>
                    <th>Size</th>
                    <th>Hash</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                {assetCreation.pendingFiles.map(file => (
                    <tr key={file.content_hash}>
                        <td>{file.name}</td>
                        <td>{file.size}</td>
                        <td>{file.content_hash.substring(0, 8)}</td>
                        <td>{formatISO(file.created)}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </Box>
    );
};

export default Uploads;